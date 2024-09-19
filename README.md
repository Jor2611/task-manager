# Task Manager Application

This is a **Task Manager** application built with **NestJS** and **PostgreSQL**, designed to manage tasks efficiently with core features like task creation, updating, filtering, sorting, pagination, and reporting.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete tasks.
- **Task Listing**: List tasks with support for filtering, sorting, and pagination.
- **Report Generation**: Generate reports by:
  - Period (start and end date)
  - User (via user_id)
- **Task States**: 
  - **TODO**: Initial state when the task is created.
  - **IN_PROGRESS**: The next state when a task is assigned to a user.
  - **DONE**: Final state when the task is completed.
  - **CANCELLED**: Final state when the task is canceled.

## Task Lifecycle

1. **TODO**: The initial state when the task is created.
   - A task can move from `TODO` to `IN_PROGRESS` only when a user is assigned to it.
   - No other transitions are allowed from `TODO` except to `IN_PROGRESS`.
   
2. **IN_PROGRESS**: 
   - From `IN_PROGRESS`, the task can be switched to either:
     - **DONE** (when the task is completed).
     - **CANCELLED** (if the task is canceled).
   - It is not possible to move back to `TODO` once the task is in progress.

3. **DONE** and **CANCELLED**: 
   - These are **final states**, meaning the task can no longer change its state once it is marked as done or canceled.
   - Only other attributes of the task (e.g., title, description, priority) can be updated after reaching these states.

## Task Priorities

Tasks can have priorities that are represented by integers from 1 to 3:
- **1**: Low Priority
- **2**: Medium Priority
- **3**: High Priority

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jor2611/task-manager.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your PostgreSQL database and configure the environment variables in `.env.development` and `.env.test` files:
  `.env.development`
   ```
   PORT=[APP_PORT]
   PG_HOST=localhost
   PG_PORT=5433
   PG_DATABASE=task_manager_dev
   PG_USERNAME=postgres_dev_user
   PG_PASSWORD=postgres_dev_password
   ALLOWED_ORIGINS=* 
   ```
   `.env.test`
   ```
   PORT=[APP_PORT]
   PG_HOST=localhost
   PG_PORT=5434
   PG_DATABASE=task_manager_test
   PG_USERNAME=postgres_test_user
   PG_PASSWORD=postgres_test_password
   ALLOWED_ORIGINS=* 
   ```
   Note: These are the environment configurations to work with Docker Compose. If you're not using Docker, you may need to adjust these settings according to your local PostgreSQL setup.
4. Build app
     ```bash
   npm run build
   ```
5. Run Docker Compose to set up the development and test databases:
   ```bash
   docker-compose up
   ```
   This command will start PostgreSQL containers for both development and test environments.

6. Run database migrations:
   ```bash
   npm run typeorm:dev migration:run -- -d ./src/db.dataSource.ts 
   ```
   Note: This command should be executed only once. For the test environment, migrations will run automatically when you run tests.
7. Start the application:
   ```bash
   npm run start:dev
   ```

## Usage

- Access the API at: `http://localhost:${PROVIDED_PORT}`
- Use the following routes to manage tasks and generate reports.

# Task API Documentation

## Base URL
`/task`

### 1. List Tasks
- **Method**: `GET`
- **Path**: `/task`
- **Query Parameters**:
  - `page` (optional, integer, default: 1): The page number for pagination.
  - `limit` (optional, integer, default: 10): The number of tasks to return per page.
  - `priority` (optional, integer, range: 1-3): Filter tasks by priority.
  - `owner` (optional, integer): Filter tasks by owner ID.
  - `state` (optional, enum: TaskState): Filter tasks by state (e.g., TODO, IN_PROGRESS, DONE).
  - `sortBy` (optional, string): Sort tasks by 'id' or 'priority'.
  - `sortOrder` (optional, string): Sort order ('asc' or 'desc').

- **Response**:
  - **200 OK**
    - **Headers**:
      - `X-Total-Count`: Total number of tasks available.
    ```json
    {
      "msg": "TASKS_FETCHED",
      "data": [ /* Array of Task objects */ ]
    }
    ```

### 2. Read Task
- **Method**: `GET`
- **Path**: `/task/:id`
- **Path Parameters**:
  - `id` (integer): The ID of the task to retrieve.

- **Response**:
  - **200 OK**
    ```json
    {
      "msg": "TASK_FETCHED",
      "data": { /* Task object */ }
    }
    ```

### 3. Create Task
- **Method**: `POST`
- **Path**: `/task`
- **Request Body**:
  ```json
  {
    "title": "string (min: 2, max: 35)",
    "description": "string (min: 10, max: 150)",
    "priority": "integer (1-3)",
    "assign_to": "integer (optional)"
  }
  ```

- **Response**:
  - **201 Created**
    ```json
    {
      "msg": "TASK_CREATED",
      "data": { /* Created Task object */ }
    }
    ```

### 4. Generate Report
- **Method**: `POST`
- **Path**: `/task/report`
- **Request Body**:
  ```json
  {
    "user_id": "integer (optional)",
    "period_from": "string (ISO date)",
    "period_to": "string (ISO date)"
  }
  ```

- **Response**:
  - **200 OK**
    ```json
    {
      "msg": "REPORT_GENERATED",
      "data": { /* Report data */ }
    }
    ```

### 5. Update Task
- **Method**: `PATCH`
- **Path**: `/task/:id`
- **Path Parameters**:
  - `id` (integer): The ID of the task to update.

- **Request Body**:
  ```json
  {
    "title": "string (optional)",
    "description": "string (optional)",
    "priority": "integer (1-3, optional)",
    "assigned_user_id": "integer (optional)",
    "state": "TaskState (optional)"
  }
  ```

- **Response**:
  - **200 OK**
    ```json
    {
      "msg": "TASK_UPDATED",
      "data": { /* Updated Task object */ }
    }
    ```

### 6. Delete Task
- **Method**: `DELETE`
- **Path**: `/task/:id`
- **Path Parameters**:
  - `id` (integer): The ID of the task to delete.

- **Response**:
  - **200 OK** : by convention must be 204 no-content but for the response consistency 200 OK is ok.
    ```json
    {
      "msg": "TASK_DELETED",
      "data": {
        "id": number
      }
    }
    ```
    
## Custom API Response

All API responses follow a consistent and customized pattern:
```json
{
  "success": boolean,
  "msg": "MSG_CODE",
  "data": "if there is any data"
}
```
- **success**: Indicates whether the operation was successful.
- **msg**: A message code that identifies the result of the operation (useful for i18n or localization).
- **data**: Any relevant data returned from the operation (if applicable).

---

## Testing

The project includes both **unit tests** and **end-to-end (e2e) tests** to ensure code quality and functionality. To run the tests, follow the instructions below.

### Unit Tests

```bash
npm run test:watch
```

### End-to-End (e2e) Tests

```bash
npm run test:e2e
```

Make sure that the `.env.test` file is properly set up before running tests, as it is crucial for configuring the test environment.


### Cleanup Docker Compose

After you're done with development or testing, you can clean up the Docker containers and volumes using the following command:

```bash
docker-compose down -v
```

