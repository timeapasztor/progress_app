## Progress Application

->My 'progressList' state is the main state holding the progress in one place.
->ProgressList is an array of objects, each object represents one category, contains all tasks and an extra parameter: the 'disabled'.

##In my solution I also paid attention to the details and edge cases, for example:

- adding unlimited categories is available to the user
- adding unlimited tasks is also available, note: tasks can be added to any categories which are yet to completed or is currently open
- for previously completed category to add task -> a task needs to be opened from that category, and addition can be made after.
- adding a "Remove" section to be able to edit tasks
- only the currently enabled category's tasks can be removed
- when a category has all it's tasks checked, then the category becomes completed and locked
- although, reopen is possible: the user needs to agree that unlocking that task will affect the the already completed ones, so all the tasks after that will be unlocked for double-checking changes

##Proposals for the future:

- to include drag and drop between the categories and tasks, to fasten the changes
- when progress on a topic is fully completed, after the modal ask the user if new progress should be started, and save the previous progress to DB
- adding subtasks to tasks, and/or action-points and assign them to roles (fetched from DB)
- generate PDF functionality for quick sharing in between users
- possibility to remove category once it has no tasks
- write more tests to check the functionality

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
