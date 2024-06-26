import React from 'react';
import './App.css';
import Header from './Components/Header';
import Post from './Components/Post';
import { Route, Routes } from "react-router-dom"
import Layout from './Components/Layout';
import IndexPage from './Components/IndexPage';
import LoginPage from './Components/LoginPage';
import RegisterPage from './Components/RegisterPage';
import { UserContextProvider } from './Components/UserContext';
import CreatePost from './Components/CreatePost';
import PostPage from './Components/PostPage';
import EditPost from './Components/EditPost';

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route index element={<IndexPage />} />
          <Route path={'/Components/login'} element={<LoginPage />} />
          <Route path={'/Components/register'} element={<RegisterPage />} />
          <Route path={'/Components/create'} element={<CreatePost />} />
          <Route path={'/Components/post/:id'} element={<PostPage />} />
          <Route path={'/Components/edit/:id'} element={<EditPost />} />
        </Route>
      </Routes>
    </UserContextProvider>

  );
}

export default App;
