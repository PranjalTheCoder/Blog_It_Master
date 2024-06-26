import React, { useEffect, useState } from "react";
import Post from "./Post";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        fetch('http://localhost:4000/post').then(response => {
            response.json().then(posts => {
                // console.log(posts);
                setPosts(posts);
            })
        })
    }, [])

    return (
        <React.Fragment>
            {posts.length > 0 && posts.map(post => (
                <Post  {...post} />
            ))}
        </React.Fragment>
    );
};