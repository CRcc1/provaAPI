const mysql = require('mysql2')

const conexao = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'teste_node'
})



conexao.connect((erro) => {
  if(erro != null){
    console.log('Erro ao se conectar ao banco de dados: ' + erro)
  }
  
  console.log('Conectado com sucesso')
  
  
  const checaTabela = 'select 1+1 from Alunos';
  conexao.query(checaTabela, (erro,resultado) => {
    if(!erro) return
    const createTabela = 'create table Alunos ( id int auto_increment primary key, nome varchar(50) not null, matricula varchar(10) not null)'
    conexao.query(createTabela, (erro,resultado) => {
      if(erro){
        throw erro
      }
      console.log("Tabela criada com sucesso")
      console.log(resultado)
  
    })
    
  })

})

module.exports = conexao