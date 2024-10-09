import React, { useContext, useEffect, useCallback } from "react";

import Editor from "@monaco-editor/react";
import { PostContext } from "../context/PostContext";
import { io } from "socket.io-client";
import { useLocation, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ['websocket', 'polling'],
  forceNew: true,
});

export const EditorComp = () => {
  const { code, setCode, setJoinedUsers, selectedLanguage } = useContext(PostContext);
  const location = useLocation();
  const params = useParams();

  const options = {
    selectOnLineNumbers: true,
  };

  const handleChange = (value, event) => {
    setCode(value);
  };

  function handleEditorValidation(markers) {
    markers.forEach((marker) => console.log("onValidate:", marker.message));
  }

  const updateJoinedUsers = useCallback((users) => {
    setJoinedUsers(users);
  }, [setJoinedUsers]);

  useEffect(() => {
    const data = {
      name: location.state,
      // This line sets the 'name' property of the data object to the value of location.state.
      // location.state likely contains the user's name, which was passed to this component
      // when navigating to this page. This name will be used to identify the user in the room.
      roomId: params.id,
    };
    socket.emit("setup", { data });

    socket.on("joined", (data) => {
      console.log('Joined event received:', data);
      updateJoinedUsers(data.users);
      toast.success(`${data.user.name} joined the room`);
    });

    socket.on("user_left", (data) => {
      console.log('User left event received:', data);
      updateJoinedUsers(data.users);
      toast.error(`${data.user.name} left the room`);
    });

    return () => {
      socket.off("joined");
      socket.off("user_left");
    };
  }, [location.state, params.id, updateJoinedUsers]);

  useEffect(() => {
    console.log('Joining room:', params.id);
    socket.emit("join room", {
      uuid: params.id,
      name: location.state,
    });
  }, [params.id, location.state]);

  useEffect(() => {
    const data = {
      uuid: params.id,
      name: location.state,
      code,
    };
    socket.emit("new input", data);
  }, [code, params.id, location.state]);

  useEffect(() => {
    socket.on("input recieved", (data) => {
      console.log('Input received:', data);
      setCode(data);
    });

    return () => {
      socket.off("input recieved");
    };
  }, [setCode]);

  useEffect(() => {
    const handleConnect = () => console.log('Socket connected');
    const handleDisconnect = () => console.log('Socket disconnected');
    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to the server. Please try again later.');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  return (
    <div className="col-span-2">
      <div className="block">
        <Editor
          className="editor"
          width="100%"
          height="76vh"
          language={selectedLanguage?.value || "javascript"}
          theme="vs-dark"
          value={code}
          options={options}
          onChange={handleChange}
          onValidate={handleEditorValidation}
          defaultValue={code}
        />
      </div>
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 2000,
          style: {
            fontSize: 15,
            padding: '15px 12px'
          }
        }}
      />
    </div>
  );
};
