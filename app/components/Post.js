import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import { useSocket } from '../hooks/useSocket'; // Assuming you have a custom hook for Socket.io

const Post = ({ post }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments); // Initial comments from props
  const socket = useSocket(); // Custom hook to establish Socket.io connection

  useEffect(() => {
    if (socket) {
      socket.on('newComment', (newComment) => {
        setComments((prevComments) => [...prevComments, newComment]);
        scrollToBottom();
      });
    }

    // Clean up listener on unmount
    return () => {
      if (socket) {
        socket.off('newComment');
      }
    };
  }, [socket]);

  const handleLike = async () => {
    await axios.post(`http://localhost:3001/posts/${post._id}/like`);
    // You might want to update the like count in state or refresh data
  };

  const handleComment = async () => {
    if (comment.trim()) {
      const newComment = { text: comment, username: 'Comments:' }; // Replace 'User' with actual username or user data
      await axios.post(`http://localhost:3001/posts/${post._id}/comment`, { comment: newComment });
      setComments([...comments, newComment]);
      setComment('');
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    // Scroll to bottom of comments list
    const commentList = document.getElementById('comment-list');
    if (commentList) {
      commentList.scrollTop = commentList.scrollHeight;
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', my: 2, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
      {/* Post Image */}
      <CardMedia
        component="img"
        height="400"
        image={post.imageUrl}
        alt="Post image"
        sx={{ objectFit: 'cover', borderBottom: '1px solid #f0f0f0' }}
      />

      {/* Post Content */}
      <CardContent sx={{ paddingBottom: '16px' }}>
        {/* Post Description */}
        <Typography variant="body1" component="div" sx={{ fontWeight: 500, mb: 1 }}>
          {post.description}
        </Typography>

        {/* Like and Comment Counts */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton size="small" onClick={handleLike} sx={{ p: 1 }}>
            <FavoriteIcon color="secondary" />
          </IconButton>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {post.likes} likes
          </Typography>
          <ChatBubbleOutlineIcon color="action" />
          <Typography variant="body2">
            {comments.length} comments
          </Typography>
        </Box>

        {/* Comments Section */}
        <List id="comment-list" sx={{ maxHeight: '200px', overflowY: 'auto' }}>
          {comments.map((comment, index) => (
            <ListItem key={index} disablePadding>
              <Typography variant="body2">
                <strong>{comment.username}</strong> {comment.text}
              </Typography>
            </ListItem>
          ))}
          <Divider />

          {/* Comment Input Field */}
          <ListItem disablePadding>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Add a comment..."
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleComment();
                }
              }}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default Post;
