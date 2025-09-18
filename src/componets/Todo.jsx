import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TodoImg from "../assets/todo.gif";
import { io } from "socket.io-client";
let socket = io("http://192.168.0.167:3001");
const Todo = () => {
  const [todos, setTodos] = useState({
    id: "",
    name: "",
    message: "",
  });
  const [data, setData] = useState([]);
  const [add, setAdd] = useState(false);
  const [searchData, setSerchData] = useState("room1");
  const [chat, setChat] = useState({ d: false, id: null });
  const [del, setDel] = useState(false);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setTodos({ ...todos, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setAdd(true);
    if (todos.name != "" || todos.message != "") {
      let getTodos = JSON.parse(localStorage.getItem("todos")) || [];
      getTodos.push({
        id: new Date(),
        name: todos.name,
        message: todos.message,
      });
      // localStorage.setItem("todos",JSON.stringify(getTodos))
      socket.on("ready_by", (data) => {
        // setData(data)
        localStorage.setItem("todos", data);
      });
      setData(getTodos);
      setEdit(false);
      socket.emit("toast", todos);
      socket.on("toast", (data) => {
        toast.success(`Data Successfully Entered! - ${data.name}`);
      });
      // alert("Data Successfully Entered!")
      setTodos({
        name: "",
        message: "",
      });
      setLoading(false);
    } else {
      // socket.emit("toast",todos || "");
      // socket.on("toast",(data)=>{
      toast.success(`All Field is Required!`);
      // })
      socket.off("toast");
      setLoading(false);

      // alert('All Field is Required!')
    }
    // socket.off("toast")
  };

  const handleEdit = (e) => {
    const getTodos = JSON.parse(localStorage.getItem("todos"));
    const editData = getTodos.find((d) => d.id === e.id);
    //  if(e.id===chat.id){
    //     alert("Usert is Editing....")
    //  }

    setEdit(true);
    setTodos({
      id: editData.id,
      name: editData.name,
      message: editData.message,
    });
  };
  const handleDelete = (e) => {
    setDel(true);
    let localDel = JSON.parse(localStorage.getItem("todos")) || [];
    // let localDelEdit  = localDel.filter()
    setData((pre) => pre.filter((d) => d.id != e.id));
    // localStorage.setItem("todos",JSON.stringify(data))
    //   console.log("localdel",localDel)
    // setDel(false)
  };
  const UpdateData = (e) => {
    e.preventDefault();
    let editLocal = JSON.parse(localStorage.getItem("todos"));
    setLoading(true);
    let localData = editLocal.map((e) => {
      return e.id === todos.id
        ? { ...e, name: todos.name, message: todos.message }
        : e;
    });
    localStorage.setItem("todos", JSON.stringify(localData));
    setData(localData);
    setEdit(false);
    setChat({ d: false, id: null });
    alert("Data Successfully Updated!");
    setTodos({
      name: "",
      message: "",
    });
    setLoading(false);
  };
  if (searchData) {
    socket.emit("join_room", searchData);
    socket.emit("createUser");
  }

  useEffect(() => {
    console.log("data...!!", data);
    socket.emit("message", { room_id: searchData, data });
    // localStorage.setItem("todos",JSON.stringify(data))

    let s = socket.emit("getUser", socket.id);
    if (edit) {
      console.log("editing......", s);
      console.log("socker id for edit ", s.id);
      socket.emit("editing", todos, s.id);
      socket.off("editing");
      socket.off("userBlock");
    }
    // if(!edit){
    //   socket.off("editing")
    //   socket.off("userBlock")
    // }
    socket.on("userBlock", (data) => {
      console.log("Receiving something here", data, s.id);
      // userBLOCKING -
      // let editId = data.editing_user;
      // // if(!edit){
      // //   editId = null
      // // }
      if (s.id != data.editing_user) {
        toast.warn(`Sorry you cant edit this - ${data.data.name}`);
        // alert("Sorry you cant edit this");
      }
      // socket.off("editing")
    });
    if (data != [] || del) {
      socket.emit("read_by", data);
      socket.on("ready_by", (data) => {
        // setData(data)
        localStorage.setItem("todos", data);
      });
    }
    loading === false &&
      socket.on("read_by", (newdata) => {
        setData(newdata);
        localStorage.setItem("todos", JSON.stringify(newdata));
        socket.off("toast");
      });
  }, [todos, loading, del, edit]);

  useEffect(() => {
    if (del === true) {
      console.log("del", data);
      localStorage.setItem("todos", JSON.stringify(data));
    }
  }, [del]);
  useEffect(() => {
    if (localStorage.getItem("todos")) {
      socket.emit("read_by", JSON.parse(localStorage.getItem("todos")));
    }
    if (!localStorage.getItem("todos")) {
      socket.on("read_by", (data) => {
        localStorage.setItem("todos", JSON.stringify(data));
      });
    }
  }, []);
  useEffect(() => {
    // if(edit){
    //   socket.on("read_by",(data)=>{
    //     localStorage.setItem("todos",JSON.stringify(data))
    //   })
    //   // socket.off("userBlock")
    // }
  }, [edit]);
  return (
    <div className="todos">
      <form action="" onSubmit={edit ? UpdateData : handleSubmit}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignContent: "center",
            justifyContent: "center",
            width: "20%",
          }}
        >
          <h2>{!edit ? "Add Todos" : "Edit Todo"} </h2>
          <img
            style={{ borderRadius: "10px" }}
            src={TodoImg}
            height={100}
            width={100}
            alt="todo-img"
          />
        </div>
        <div style={{ width: "50%" }}>
          <div className="add">
            <input
              type="text"
              name="name"
              value={todos.name}
              onChange={handleChange}
              placeholder="Enter Name"
            />
          </div>
          <div className="add">
            <input
              type="text"
              name="message"
              value={todos.message}
              onChange={handleChange}
              placeholder="Message...."
            />
          </div>
          <div className="add">
            <button className="btn" type="submit">
              {!edit ? "Add" : "Edit"}
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setDel(false);
                setEdit(false);
                setTodos({
                  id: "",
                  name: "",
                  message: "",
                });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
      <div className="table" style={{ flexDirection: "column", gap: "20px" }}>
        <div style={{ width: "30%" }}>
          {/* <input type="text" onChange={(e)=>setSerchData(e.target.value)}  style={{width:"100%"}} placeholder='Enter Room Id....' />
     <button onClick={JoinRoom}>Join</button> */}
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Message</th>
              <th>Action</th>
            </tr>
          </thead>
          {data != [] && loading === false ? (
            <>
              {data.map((e, i) => {
                return (
                  <tr key={i}>
                    <td>{e.name}</td>
                    <td>{e.message}</td>
                    <td>
                      <button
                        className="btn btn-e"
                        style={{ background: chat.id === e.id && "gray" }}
                        disabled={chat.id === e.id}
                        onClick={() => {
                          handleEdit(e);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-d"
                        onClick={() => handleDelete(e)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </>
          ) : (
            "Data Not Found!"
          )}
        </table>
      </div>
    </div>
  );
};

export default Todo;
