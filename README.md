# AppDev2 Midterm Project: A RESTful API for Managing Todos
## Project Summary
This project is a RESTful API built using Node.js that mimics the functionality of [JSONPlaceholder's todos endpoint](https://jsonplaceholder.typicode.com/todos). It uses the **fs** module to store and retrieve data from a JSON file (`todos.json`) and implements a logging system to track API actions in a log file (`log.txt`). The API supports full CRUD operations for managing todos.

## Features
- Fetch all todos or filter by completion status.
- Fetch a specific todo by ID.
- Create, update, and delete todos.
- Logs all API actions with timestamps in `log.txt`.
- Handles errors gracefully with appropriate HTTP status codes.

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/romeyiow/appdev2-midterm-project.git
   ```
2. Navigate to the project directory:
   ```sh
   cd appdev2-midterm-project
   ```

## Running the API
1. Start the server:
   ```sh
   node server.js
   ```
2. The server will run on `http://0.0.0.0:3000` by default.

## API Endpoints
| Method | Endpoint   | Description                                                 |
| ------ | ---------- | ----------------------------------------------------------- |
| GET    | /todos     | Fetch all todos (optional filtering by `completed` status). |
| GET    | /todos/:id | Fetch a specific todo by ID.                                |
| POST   | /todos     | Create a new todo.                                          |
| PUT    | /todos/:id | Update a todo by ID.                                        |
| DELETE | /todos/:id | Delete a todo by ID.                                        |


## Testing the API
You can use the `test.http` file included in the project to test the API endpoints using an HTTP client like [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) in Visual Studio Code.

## Logging
All API actions are logged in `log.txt` with timestamps and details about the requests.

## Notes
- Ensure that `todos.json` and `log.txt` are present in the project directory.
- The server is configured to run on `0.0.0.0` to support environments like GitHub Codespaces.


## Video Demonstration
To help you better understand how this API works, I've prepared a video demonstration. [In this video](https://drive.google.com/drive/folders/1Nk8-T4m0G2c_0UrkNKNfgvE0gkG9ULx9?usp=sharing), you’ll see:

1. An overview of the `todos.json` file and its structure.
2. How to start the API server and interact with it.
3. Demonstrations of all the API endpoints:
   - Fetching all todos.
   - Fetching a specific todo by ID.
   - Adding a new todo.
   - Updating an existing todo.
   - Deleting a todo.
4. Error handling and testing invalid endpoints.

This video will guide you step-by-step through the process of using the API, making it easier to follow along and understand its functionality.

### Video Link: [Demo](https://drive.google.com/drive/folders/1Nk8-T4m0G2c_0UrkNKNfgvE0gkG9ULx9?usp=sharing)

# About Me
Hi! My name is Jerome Imperial and my friends call me Jers :> ...
I'm an INFJ-T whose passion is playing chess, soccer, and guitar. I'm not exactly into coding but I found meaning in life solving problems especially those that could help the neglected people of the Philippines. For that reason, I value my knowledge in coding because solving problems with IT is a common trend this days.     

## Skills
- Web Dev (MERN Stack)
- Data Analysis with Python
- Reading the room
- Chess
- Singing (???)

## Contact
- Email: jeromeimperial@student.laverdad.edu.ph
- LinkedIn: [www.linkedin.com/in/thereliablerome](www.linkedin.com/in/thereliablerome)
- GitHub: [romeyiow](https://github.com/romeyiow)
