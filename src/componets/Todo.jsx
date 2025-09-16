import React,{useEffect, useState} from 'react'
import TodoImg from "../assets/todo.gif"
import { io } from "socket.io-client"
let socket =   io("http://127.0.0.1:3001");
const Todo = () => {
    const [todos,setTodos] = useState({
      id: "",
        name:"",
        message:""
    })
    const [data,setData] = useState([]) 
    const [searchData,setSerchData] = useState(null)
    const [del,setDel] = useState(false)
const [edit,setEdit] = useState(false)
const [loading,setLoading] = useState(false)
    const handleChange = (e)=>{
        setTodos({...todos,[e.target.name]:e.target.value})
    }
    const handleSubmit = (e)=>{
        e.preventDefault()
        setLoading(true)
        if(todos.name != "" || todos.message != ""){
         setData([...data,{id:new Date(),name:todos.name,message:todos.message}])
            setEdit(false)
            alert("Data Successfully Entered!")
            setTodos({
               name:"",
               message:"" 
            })
        }
        else{

            alert('All Field is Required!')
        }
        setLoading(false)
        
    }

    const handleEdit = (e)=>{
       const editData = data.find(d=>d.id===e.id);
       setTodos({id:editData.id,name:editData.name,message:editData.message});
       setEdit(true)
    }
    const handleDelete = (e)=>{
      setDel(true)
        setData(pre=>pre.filter(d=>d.name != e.name))
    }
    const UpdateData = (e)=>{
        e.preventDefault()
        setLoading(true)
         setData(pre=>pre.map((e)=>{
         return e.id === todos.id ? {...e,name:todos.name,message:todos.message} : e
        
    }))
    setEdit(false)
            alert("Data Successfully Updated!")
            setTodos({
               name:"",
        message:"" 
            })
       setLoading(false)  
    }
  // const filterData = loading===false && data!=""? data.filter((e)=>{
  //       const matchData = e.name.toLowerCase().includes(searchData)
  //       return matchData;
  // }):[]
  //   console.log("data",filterData)
const JoinRoom = ()=>{
  if(searchData){
    socket.emit("join_room",searchData)
  }
}
useEffect(()=>{
  console.log("data...!!",data)
    socket.emit("message",{room_id:searchData,data})
    if(data !="" || del){
      socket.emit("read_by",data)
    }
   loading===false && socket.on("read_by",(newdata)=>{
      setData(newdata)
    }) 
},[todos,loading,del])
  return (
    <div className='todos'>
        <form action="" onSubmit={edit ? UpdateData : handleSubmit}>
           <div style={{display:"flex",flexDirection:"column",gap:"10px",alignContent:"center",justifyContent:"center",width:"20%"}}>
            <h2>{!edit ?"Add Todos":"Edit Todo"} </h2>
            <img style={{borderRadius:"10px"}} src={TodoImg} height={100} width={100} alt="todo-img" />
            </div>
            <div style={{width:"50%"}}>
      <div className='add'>
        <input type="text" name='name' value={todos.name} onChange={handleChange} placeholder='Enter Name'/>
      </div>
      <div className='add'>
        <input type="text" name='message' value={todos.message} onChange={handleChange} placeholder='Message....'/>
      </div>
      <div className='add'>
       <button className='btn' type='submit'>{!edit?"Add":"Edit"}</button>
      </div>
      </div>
      </form>
<div className='table' style={{flexDirection:"column", gap:"20px"}}>
  <div style={{width:"30%"}}>
    <input type="text" onChange={(e)=>setSerchData(e.target.value)}  style={{width:"100%"}} placeholder='Enter Room Id....' />
     <button onClick={JoinRoom}>Join</button>
  </div>
  <table>
    <thead>
    <tr>
        <th>Name</th>
        <th>Message</th>
        <th>Action</th>
    </tr>
    </thead>
    {
       data != "" && loading===false?<>{
        data.map((e,i)=>{
return <tr key={i}>
        <td>{e.name}</td>
        <td>{e.message}</td>
        <td><button className='btn btn-e' onClick={()=>{
            handleEdit(e)
            }}>Edit</button><button className='btn btn-d' onClick={
               ()=> handleDelete(e)
            }>Delete</button></td>
        </tr>
        })}</>:"Data Not Found!"
    }
  </table>
</div>
    </div>
  )
}

export default Todo
