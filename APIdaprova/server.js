const cors = require('cors')
const express = require('express');
const server = express();
const token = require('jsonwebtoken')
const conexao = require('./dataBase.js');
const chaveJwt = "minhaChave"

server.use(express.json())
server.use(cors())

server.get('/',(req, res) => {
  res.json({ mensagem: 'localhost:3000'})
});

server.post('/usuarios', (req, res) => {
  const { nomeUsuario, senhaUsuario } = req.body;

  const inserirSql = "INSERT INTO Usuarios (usuario, senha) VALUES (?, ?)";
  conexao.query(inserirSql, [nomeUsuario, senhaUsuario], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' });
    }
    res.json({ mensagem: 'Usuário cadastrado com sucesso' });
  });
});

server.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  // Simulação de autenticação no banco de dados
  const consultaSql = "SELECT * FROM Alunos WHERE nome = ?";
  conexao.query(consultaSql, [usuario, senha], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensagem: 'Erro no servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ mensagem: 'Usuário ou senha inválidos' });
    }

    // Gerar o token com informações do usuário autenticado
    const token = jwt.sign({ id: results[0].id, usuario: results[0].nome }, chaveJwt, {
      expiresIn: '1h' // Expiração de 1 hora
    });

    res.json({ token });
  });
});

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado' });
  }

  jwt.verify(token, chaveJwt, (err, usuario) => {
    if (err) {
      return res.status(403).json({ mensagem: 'Token inválido ou expirado' });
    }
    req.usuario = usuario; // Armazena os dados do token no request
    next();
  });
}

server.get('/alunos',verificarToken, (req, res) => {
  const consultaSql = "SELECT nome, matricula FROM alunos";
  conexao.query(consultaSql, (err, results) => {
    if (err) {
      console.log(err);
      throw err;
    }
    res.json(results);
  });
});

server.post('/alunos', (req,res) => {
  const nomeAluno = req.body.nome
  const matriculaAluno = req.body.matricula
  let innerSql = "INSERT INTO Alunos ( nome, matricula) VALUES ("; 
  innerSql = innerSql.concat("'",nomeAluno,"'",',') 
  innerSql = innerSql.concat("'",matriculaAluno,"'",');') 

  conexao.query(innerSql, (err, results) => {
    if(err){
      console.log(err)
      throw err
    }
    res.json({ mensagem: "Aluno cadastrado com sucesso"})
  })
})

server.put('/alunos/:idAluno', (req,res) => {
  let updateSql = "UPDATE Alunos SET "
  const id = req.params.idAluno;
  const novoNome = req.body.nome ?? "";
  const novaMatricula = req.body.matricula ?? "";

  if(novoNome != ""){
    updateSql = updateSql.concat("nome = '",novoNome,"'",novaMatricula == "" ?  "" : ",")
  }
  if(novaMatricula != ""){
    updateSql = updateSql.concat("matricula = '",novaMatricula,"'")
  }
  updateSql += ' WHERE id = ' + id

  conexao.query(updateSql, (err, results) => {
    if(err){
      console.log(err)
      throw err
    }
    res.json({ message:  "Aluno atualizado com sucesso" })
  })
  
});


server.delete('/alunos/:idAluno', (req,res) => {
  const idAluno  = req.params.idAluno
  let deleteSql = "DELETE FROM Alunos WHERE id = " + idAluno
  conexao.query(deleteSql, (err, results) => {
    if(err){
      console.log(err)
      throw err
    }
    res.json({ mensagem: "Aluno deletado com sucesso" })
  })
})

server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})