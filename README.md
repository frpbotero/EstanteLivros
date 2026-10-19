<p align="center">
   <img alt="License" src="https://img.shields.io/badge/license-MIT-%23845afd">
   <img alt="Stargazers" src="https://img.shields.io/badge/Stars-1-%23845afd">
  <img alt="Stargazers" src="https://img.shields.io/badge/Forks-0-%23845afd">
 
  
  
</p>
<br><br>
<p align="center">

  <img alt="Bookstore" src="https://github.com/FeBotero/EstanteLivros/blob/main/frontend/src/assets/log.png">
 </p>                
 
 <p align="center">
 <a href="#sobre">Sobre</a> •
 <a href="#layout">Layout</a> • 
 <a href="#funcoes">Funcionalidades</a> •
 <a href="#como_executar">Como executar</a> • 
 <a href="#tecnologias">Tecnologias</a> • 
 <a href="#autor">Autor</a> • 
 <a href="#licenca">Licença</a>
</p>



<h2 id="sobre">Sobre</h2>

<p>O projeto foi idealizado inicialmente para organizar os livros que possuímos em casa, ao longo do desenvolvimento foi visto que poderia adicionar outras funcionalidades que agregariam no meu desenvolvimento.</p>
<p>A ideia era listar os livros disponiveis, mas construímos um CRUD completo para os livros e solicitação de reservas ou emprestimos. Assim foi possivel desenvolver utilizando modais para apresentação em tela de fomulários e relatórios.</p>

 <h2 id="layout">Layout</h2>
 <a href="https://estante-livros.vercel.app/"><p>Demo</p></a>
 
<img alt="ADM User" src="https://github.com/FeBotero/EstanteLivros/blob/main/frontend/src/assets/adm.png">
<img alt="Public User" src="https://github.com/FeBotero/EstanteLivros/blob/main/frontend/src/assets/user.png">


<h2 id="funcoes">Funcionalidades</h2>

<ul>
   <li>Cadastro de livros</li>
   <li>Edição de livros</li>
   <li>Exclusão de livros</li>
   <li>Listagem de livros</li>
   <li>Cadastro de reservas</li>
   <li>Edição de reservas</li>
   <li>Exclusão de reservas</li>
   <li>Listagem de reservas</li>
   <li>Relatório de Uso</li>
   <li>Rota Autenticada - Em construção</li>
   <li>Sistema de Login - Em construção</li>
   
   
</ul>
   
   
  

  <h2 id="como_executar">Como executar</h2>
  <h3>Execute os comandos no seu terminal:</h3>
  
<p>1 - Clone o repositório</p>
   
`$ https://github.com/FeBotero/EstanteLivros.git`

<p>2 - Acesse no repositório localmente</p>

`$ cd EstanteLivros`

<h3>Agora vamos instalar as dependencia do backend e do frontend.</h3>

<p>3 - selecione o backend do repositório</p>

`$ cd backend`

<p>4 - Instale as dependências</p>

`$ npm install`

<p>5 - selecione o frontend do repositório</p>

`$ cd frontend`

<p>6 - Instale as dependências</p>

`$ npm install`

<p>7 - Acesse novamente o backend e o backend da aplicação</p>

`$ npm start`

<p>8 - Acesse novamente o frontend e o frontend da aplicação</p>

`$ npm start`

      


<h3>Com Docker</h3>

`$ cp .env.example .env` (defina `JWT_SECRET`; `GOOGLE_CLIENT_ID` é opcional)

`$ docker compose up -d --build`

Frontend em http://localhost:5173 e API em http://localhost:3333. Cada usuário cria a própria conta e tem um link público em `/u/<slug>`.

<h2 id="tecnologias">Tecnologias</h2>
  <ul>
  <li>React</li>
  <li>CSS </li>
  <li>NodeJS</li>
  <li>MongoDB</li>
  </ul>
   
<h2 id="autor">Autor</h2>

<p>
  Projeto feito por <a href="https://github.com/FeBotero">Felipe Botero<a/></p>
  
  
<h2 id="licenca">Licença</h2>
   
<h4>Este projeto está sob a licença MIT. Veja o arquivo <a href="https://github.com/FeBotero/Inovatec_2022/blob/main/LICENSE.txt">LICENSE</a> para mais detalhes.</h4>
