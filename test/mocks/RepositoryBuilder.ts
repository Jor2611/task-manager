
// This file is a custom mock for TypeORM repositories

import { 
  EntityManager, 
  EntityTarget, 
  FindOneOptions, 
  FindOptionsWhere, 
  ObjectLiteral, 
  SelectQueryBuilder
} from "typeorm";
import { Task } from "../../src/task/task.entity";

type AppEntities = Task;

interface ICollections {
  tasks?: Task[]
}

const collectionMap = new Map<any, keyof ICollections>([
  [Task, 'tasks']
]);

interface IRepositoryMock {
  withEntityManager(): IRepositoryMock;
  withQueryBuilder(): IRepositoryMock;
  build(): IRepositoryMockBuild;
}

interface IRepositoryMockBuild {
  collections: jest.Mock;
  collection: jest.Mock;
  existsBy: jest.Mock;
  find: jest.Mock;
  findBy: jest.Mock;
  findOne: jest.Mock;
  findOneBy: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  manager?: { transaction: jest.Mock<any, any, any> };
  entityManagerMock?: Partial<EntityManager>;
  createQueryBuilder?: jest.Mock<any,any,any>;
  queryBuilderMock? : SelectQueryBuilder<any>;
  seedCollections: (collections: ICollections) => ICollections;
  resetData: () => void;
}

export class RepositoryMock<T extends AppEntities> implements IRepositoryMock {
  private collections: ICollections = {};
  private entityManagerMock: Partial<EntityManager>;
  private queryBuilderMock: SelectQueryBuilder<T>;
  private skipValue: number;
  private takeValue: number;

  get collection(): T[] {
    const collectionName = collectionMap.get(this.entityTarget);
    return this.collections[collectionName] as T[];
  }

  constructor(private entityTarget: EntityTarget<T>){
    const collectionName = collectionMap.get(entityTarget);
    this.collections[collectionName] = [];
  }

  withQueryBuilder(): IRepositoryMock {
    this.queryBuilderMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      skip: jest.fn().mockImplementation((value: number) => {
        this.skipValue = value;
        return this.queryBuilderMock;
      }),
      take: jest.fn().mockImplementation((value: number) => {
        this.takeValue = value;
        return this.queryBuilderMock;
      }),
      getMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(this.collection.slice(this.skipValue, this.skipValue + this.takeValue));
      }),
      getCount: jest.fn().mockImplementation(() => {
        return Promise.resolve(this.collection.length);
      }),
      //We will add currently only object notation implementation
      andWhere: jest.fn().mockImplementation((where: ObjectLiteral) => {
        const collectionName = collectionMap.get(this.entityTarget);
        const key = Object.keys(where)[0];
        this.collections[collectionName] = this.collections[collectionName].filter((col: T) => col[key] === where[key]);
        return this.queryBuilderMock; 
      }),
      orderBy: jest.fn().mockImplementation((sort: string, order?: "ASC" | "DESC") => {
        const collectionName = collectionMap.get(this.entityTarget);
        const sortOrder = order || 'ASC';

        if(!this.collection.length || !(sort in this.collection[0]) || typeof this.collection[0][sort] !== 'number'){
          return this.queryBuilderMock;
        }

        this.collections[collectionName].sort((a: T, b: T) => {
            return sortOrder === 'DESC' ? b[sort] - a[sort] : a[sort] - b[sort] 
        })

        return this.queryBuilderMock;
      })
    } as unknown as SelectQueryBuilder<T>;
    return this;
  }

  withEntityManager(): IRepositoryMock {
    this.entityManagerMock = {
      query: jest.fn(),
      findOne: jest.fn().mockImplementation(async<T extends AppEntities>(target: EntityTarget<T>, opts: FindOneOptions<T>): Promise<T | null> => {
        const collectionName = collectionMap.get(target);
        if(!collectionName || !this.collections[collectionName]) return null;
        const [[key,value]]= Object.entries(opts.where);
        return this.collections[collectionName].find((_entity) => _entity[key] === value) as T || null;
      }),
      findOneBy: jest.fn().mockImplementation(async <T extends AppEntities>(target: EntityTarget<T>, where: FindOptionsWhere<T>): Promise<T | null> => {
        const collectionName = collectionMap.get(target);
        if(!collectionName || !this.collections[collectionName]) return null;
        const [[key,value]]= Object.entries(where);
        return this.collections[collectionName].find((_entity) => _entity[key] === value) as T || null; 
      }), 
      findBy: jest.fn().mockImplementation(async <T extends AppEntities>(target: EntityTarget<T>, where: FindOptionsWhere<T>): Promise<T[]> => {
        const collectionName = collectionMap.get(target);
        if(!collectionName || !this.collections[collectionName]) return [];
        const ids = (where.id as any)._value; 
        return this.collections[collectionName].filter(_entity => ids.includes(_entity.id)) as T[]; 
      }),
      create: jest.fn().mockImplementation(<T extends AppEntities>(_: EntityTarget<T>, entityData: Object): T => ({ ...entityData } as T)),
      save: jest.fn().mockImplementation(async<T extends AppEntities>(target: EntityTarget<T>, entityData: T): Promise<T> => {
        const collectionName = collectionMap.get(target);
        if(!collectionName || !this.collections[collectionName]) return null;
        const collection = this.collections[collectionName] as T[];
  
        const entityIndex = collection.indexOf(entityData);
        const processDate = new Date();
        if(entityIndex > -1){
          Object.assign(collection[entityIndex], { ...entityData, updatedAt: processDate });
          return collection[entityIndex];
        } else {
          const generatedId = collection.length ? collection[collection.length - 1]['id'] + 1 : 1;
          const newRow = { id: generatedId, ...entityData, createdAt: processDate, updatedAt: processDate };
          collection.push(newRow);
          return newRow;
        }
      })
    }
    return this;
  }

  build(): IRepositoryMockBuild {
    let repositoryMockBuild: IRepositoryMockBuild = {
      collections: jest.fn().mockImplementation(async(): Promise<ICollections> => this.collections), 
      collection: jest.fn().mockImplementation(async(): Promise<T[]> => this.collection),
      existsBy: jest.fn().mockImplementation(async(where: FindOptionsWhere<T>): Promise<boolean> => {
        const [[key,value]]= Object.entries(where);
        return this.collection.some(_entity => _entity[key] === value);
      }),
      find: jest.fn().mockImplementation(async(): Promise<T[]> => this.collection),
      findOne: jest.fn().mockImplementation(async(opts: FindOneOptions<T>): Promise<T | null> => {
        const [[key,value]]= Object.entries(opts.where);
        let entity = this.collection.find(_entity => _entity[key] === value) || null;

        if(entity && opts.relations){
          /*If relations provided forcing dev to provide as an array of strings only*/
          if(!Array.isArray(opts.relations)) throw new Error("Please provide relations as an Array of strings!");
          
          opts.relations.forEach((_rel: string) => {
            if(this.collections[_rel]) entity = {...entity, [_rel]: this.collections[_rel]};
          });
        }

        return entity;
      }),
      findOneBy: jest.fn().mockImplementation(async(where: FindOptionsWhere<T>): Promise<T> => {
        const [[key,value]]= Object.entries(where);
        return this.collection.find(_entity => _entity[key] === value);
      }),
      findBy: jest.fn().mockImplementation(async(where: FindOptionsWhere<T>): Promise<T[]> => {
        const ids = (where.id as any)._value; 
        return this.collection.filter(_entity =>  ids.includes(_entity.id)); 
      }),
      create: jest.fn().mockImplementation((entityData: ObjectLiteral): T => entityData as T),
      save: jest.fn().mockImplementation(async(entityData: T): Promise<T> => {
        const entityIndex = this.collection.indexOf(entityData);
        const processDate = new Date();
        if(entityIndex > -1){
          Object.assign(this.collection[entityIndex], { ...entityData, updatedAt: processDate });
          return this.collection[entityIndex];
        } else {
          const generatedId = this.collection.length ? this.collection[this.collection.length - 1]['id'] + 1 : 1;
          const newRow = { id: generatedId, ...entityData, createdAt: processDate, updatedAt: processDate };
          const entityCollection = this.collections[collectionMap.get(this.entityTarget)] as T[]
          entityCollection.push(newRow);
          return newRow;
        }
      }),
      remove:  jest.fn().mockImplementation(async(entity: T): Promise<T> => {
        const collectionName = collectionMap.get(this.entityTarget);
        let entityCollection = this.collections[collectionName] as T[];
        const entityIndex = entityCollection.indexOf(entity);
        if(entityIndex > -1){
          entityCollection.splice(entityIndex, 1);
        }
        return entity; /*Actually don't need this, just trying to do close mock to Typeorm interface*/
      }),
      seedCollections: (collections: ICollections): ICollections => { 
        this.collections = collections
        return this.collections;
      },
      resetData: (): void => {
        this.collections = {};
        this.skipValue = undefined;
        this.takeValue = undefined;
      }
    };

    if(this.entityManagerMock) {
      repositoryMockBuild.manager = { transaction: jest.fn().mockImplementation(cb => cb(this.entityManagerMock)) }
      repositoryMockBuild.entityManagerMock = this.entityManagerMock;
    }

    if(this.queryBuilderMock) {
      repositoryMockBuild.createQueryBuilder = jest.fn().mockImplementation((_: string) => this.queryBuilderMock);
      repositoryMockBuild.queryBuilderMock = this.queryBuilderMock;
    }

    return repositoryMockBuild;
  }
} 

