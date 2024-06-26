import { formatISO9075 } from "date-fns";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { Navigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";


export default function Post({ _id, title, summary, cover, content, createdAt, author, likeduser, likes }) {
  const navigate = useNavigate();
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [totallikes, setlikes] = useState(likes);
  const [liketxt, setliketext] = useState('');

  useEffect(() => {
    if (userInfo == null) {
      setUserInfo(null);
      navigate("/login");
    }
    // setting Likes Count of a post
    if (likeduser.includes(userInfo.id)) {
      setliketext("Liked");
    }
    else {
      setliketext("Like");
    }
  }, []);

  const likefn = async (event) => {
    setlikes(totallikes + 1);
    if (liketxt === "Like") {
      setlikes(totallikes + 1);
      setliketext("Liked");
    }
    else {
      setlikes(totallikes - 1);
      setliketext("Like");
    }
    await fetch(`http://127.0.0.1:4000/likepost`, {
      method: 'PUT',
      body: JSON.stringify({ postId: _id, userId: userInfo.id }),
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return (
    <div className="post">
      <div className="image">
        <Link to={`Components/post/${_id}`}>
          <img src={'http://localhost:4000/' + cover} alt="" />
        </Link>
      </div>

      <div className="texts">
        <Link to={`Components/post/${_id}`}>
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <a className="author">{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">{summary}</p>
        <button onClick={likefn} className='b2'>{liketxt} {totallikes}</button>
      </div>
    </div>
  );
}