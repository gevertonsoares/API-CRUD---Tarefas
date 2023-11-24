import express from 'express';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

let app = express();
app.use(express.json());


let users = [];
let task = [];

// Rota para listar contas cadastradas
app.get('/users', (request, response) => {
  return response.json(users);
});

//Rota para feed de tasks
app.get('/users/task', (request, response) => {
  return response.json(task); 
});


// Rota para criar usuário 
app.post('/users', async (request, response) => {
  let infoRequest = request.body;
  let password = infoRequest.password;
  
  if (infoRequest.name === undefined) {
    return response.status(400).json("nome não informado!");
  }

  if (infoRequest.name.length < 2) {
    return response.status(400).json("nome deve conter mais caracteres!");
  }
  
  if (infoRequest.email === undefined) {
    return response.status(400).json("e-mail não informado!");
  }

  if (infoRequest.email.length < 2) {
    return response.status(400).json("informe email válido!");
  }

  if (infoRequest.password === undefined) {
    return response.status(400).json("senha não informada!");
  }

  if (infoRequest.password.length < 3) {
    return response.status(400).json("senha deve conter mais caractere!");
  }

  let isUser = users.find((currentUser) => {
    return currentUser.email === infoRequest.email;
  })

  if (isUser) {
    return response.status(400).json("e-mail já cadastrado!");
  }

  let isUserName = users.find((currentUserName) => {
    return currentUserName.userName === infoRequest.userName;
  })

  if (isUserName) {
    return response.status(400).json("Username já cadastrado!");
  }

  let hashearPassword = await bcrypt.hash(password, 6);

  let newUser = {
    userName: infoRequest.userName,
    name: infoRequest.name,
    email: infoRequest.email,
    password: hashearPassword,
  };

  users.push(newUser);
  return response.status(201).json(newUser);
});


// Rota para Login
app.post('/users/login', async (request, response) => {
  let infoRequest = request.body;
  let user = users.find((user) => user.email === infoRequest.email);

  if (user) {
    let match = await bcrypt.compare(infoRequest.password, user.password);

    if (match) {
      response.json({ message:'Login Bem Sucedido!'});
    } else {
      response.status(401).json({ message:'Verifique suas credenciais!'});
    }
  } else {
    response.status(401).json({ message:'Verifique suas credenciais!'});
  }
});

//Rota para criar tarefa
app.post('/users/task/:email', (request, response) => {
  let infoRequest = request.body;
  let infoParameter = request.params.email;
  let taskId = randomUUID();

  let accountCreated = users.find((user) => user.email === infoParameter);

  if(accountCreated) {
    
    let newTask = {
      id: taskId,
      userName: accountCreated.userName,
      taskText: infoRequest.taskText
    }
  
    task.push(newTask);
  
    return response.status(201).json(newTask);
  } else {
    return response.status(404).json({message: "usuário não encontrado!"});
  }
});

//Rota para atualizar tarefa pelo ID
app.put('/users/task/:taskId', (request, response) => {
  let taskId = request.params.taskId;
  let updateTask = request.body.taskText;
  let existTask = task.find(t => t.id === taskId);

  if(existTask) {
    existTask.taskText = updateTask;
    response.json(existTask);
  } else {
    response.status(404).json({message: "Tarefa não encontrada!"});
  }
});

//Rota para deletar tarefa pelo ID
app.delete('/users/task/:email/:taskId', (request, response) => {
  let taskId = request.params.taskId;
  let infoParameter = request.params.email;

  let index = task.findIndex(t => t.id === taskId);
  let contaCriada = users.find((user) => user.email === infoParameter);


  if (index !== -1 && contaCriada) {
    let deleteTask = task.splice(index, 1);
    response.json(deleteTask);
  } else {
    response.status(404).json({message: "Tarefa não encontrada!"});
  }
});

app.listen(8080, () => console.log("Servidor iniciado"));