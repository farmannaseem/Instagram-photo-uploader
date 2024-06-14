"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './components/Post';
import io from 'socket.io-client';
import Upload from './uploads/page';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const socket = io('http://localhost:3001');

  useEffect(() => {
    axios.get('http://localhost:3001/posts').then(response => {
      setPosts(response.data);
    });

    socket.on('updatePost', updatedPost => {
      setPosts(prevPosts => {
        const postExists = prevPosts.some(post => post._id === updatedPost._id);
        if (postExists) {
          return prevPosts.map(post => (post._id === updatedPost._id ? updatedPost : post));
        } else {
          return [updatedPost, ...prevPosts];
        }
      });
    });

    return () => socket.off('updatePost');
  }, [socket]);

  return (
    <div>
      <Upload/>
      {posts.map(post => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Home;
