/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const BASE_URL = "http://Private_IP:5004";  // API Base URL

    // State Variables
    const [tab, setTab] = useState(1);
    const [task, setTask] = useState('');
    const [todos, setTodos] = useState([]);  // Initialize todos as an empty array
    const [isEdit, setIsEdit] = useState(false);
    const [updateId, setUpdateId] = useState(null);

    // Tab Switch Handler
    const handleTabs = (tab) => setTab(tab);

    // Add New Task
    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${BASE_URL}/new-task`, { task });
            setTodos(Array.isArray(res.data) ? res.data : []);
            setTask('');
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    // Fetch Tasks from API
    useEffect(() => {
        axios.get(`${BASE_URL}/read-tasks`)
            .then(res => {
                setTodos(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => console.error("Error fetching tasks:", err));
    }, []);

    // Edit Task
    const handleEdit = (id, task) => {
        setIsEdit(true);
        setTask(task);
        setUpdateId(id);
    };

    // Update Task
    const updateTask = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/update-task`, { updateId, task });
            setTodos(Array.isArray(res.data) ? res.data : []);
            setTask('');
            setIsEdit(false);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // Delete Task
    const handleDelete = async (id) => {
        try {
            const res = await axios.post(`${BASE_URL}/delete-task`, { id });
            setTodos(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    // Mark Task as Completed
    const handleComplete = async (id) => {
        try {
            const res = await axios.post(`${BASE_URL}/complete-task`, { id });
            setTodos(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error marking task as completed:", error);
        }
    };

    return (
        <div className='bg-gray-100 w-screen h-screen'>
            <div className='flex flex-col w-screen h-screen justify-center items-center'>
                <h2 className='font-bold text-2xl mb-4'>ToDo List</h2>

                {/* Input Section */}
                <div className='flex gap-3'>
                    <input 
                        value={task} 
                        onChange={(e) => setTask(e.target.value)} 
                        type='text' 
                        placeholder='Enter todo' 
                        className='w-64 p-2 outline-none border border-blue-300 rounded-md' 
                    />
                    <button 
                        onClick={isEdit ? updateTask : handleAddTask} 
                        className='bg-blue-600 text-white px-4 rounded-md'
                    >
                        {isEdit ? "Update" : "Add"}
                    </button>
                </div>

                {/* Tabs Section */}
                <div className='flex text-sm w-80 justify-evenly mt-4'>
                    <p onClick={() => handleTabs(1)} className={`${tab === 1 ? 'text-blue-700' : 'text-black'} cursor-pointer`}>All</p>
                    <p onClick={() => handleTabs(2)} className={`${tab === 2 ? 'text-blue-700' : 'text-black'} cursor-pointer`}>Active</p>
                    <p onClick={() => handleTabs(3)} className={`${tab === 3 ? 'text-blue-700' : 'text-black'} cursor-pointer`}>Completed</p>
                </div>

                {/* Task List */}
                {tab === 1 && todos.map(todo => (
                    <TaskItem key={todo.id} todo={todo} handleEdit={handleEdit} handleDelete={handleDelete} handleComplete={handleComplete} />
                ))}

                {tab === 2 && todos.filter(todo => todo.status === 'active').map(todo => (
                    <TaskItem key={todo.id} todo={todo} handleEdit={handleEdit} handleDelete={handleDelete} handleComplete={handleComplete} />
                ))}

                {tab === 3 && todos.filter(todo => todo.status === 'completed').map(todo => (
                    <TaskItem key={todo.id} todo={todo} handleDelete={handleDelete} />
                ))}
            </div>
        </div>
    );
};

// Task Item Component
const TaskItem = ({ todo, handleEdit, handleDelete, handleComplete }) => (
    <div className='flex justify-between bg-white p-3 w-80 mt-3 rounded-md'>
        <div>
            <p className='text-lg font-semibold'>{todo?.task}</p>
            <p className='text-xs text-gray-600'>{new Date(todo.createdAt).toLocaleDateString()}</p>
            <p className='text-sm text-gray-700'>Status: {todo.status}</p>
        </div>

        <div className='flex flex-col text-sm justify-start items-start'>
            {todo.status !== 'completed' && (
                <>
                    <button className='text-blue-600 cursor-pointer' onClick={() => handleEdit(todo.id, todo.task)}>Edit</button>
                    <button className='text-green-600 cursor-pointer' onClick={() => handleComplete(todo.id)}>Complete</button>
                </>
            )}
            <button className='text-red-500 cursor-pointer' onClick={() => handleDelete(todo.id)}>Delete</button>
        </div>
    </div>
);

export default Home;
