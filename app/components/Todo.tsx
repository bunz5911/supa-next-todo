'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client/supabase'
import type { Database } from '@/public/types/supabase'

type Todo = Database['public']['Tables']['todos']['Row']

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      const { error } = await supabase
        .from('todos')
        .insert([{ title: newTodo, completed: false }])

      if (error) throw error
      setNewTodo('')
      fetchTodos()
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  async function toggleTodo(id: number, completed: boolean) {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id)

      if (error) throw error
      fetchTodos()
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  async function deleteTodo(id: number) {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchTodos()
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Todo List</h1>
      <form onSubmit={addTodo} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add new todo..."
            className="flex-1 px-3 py-2 border rounded text-black placeholder-gray-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </form>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-2 p-2 border rounded"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id, todo.completed)}
              className="h-5 w-5"
            />
            <span
              className={`flex-1 text-black ${
                todo.completed ? 'line-through text-black opacity-50' : ''
              }`}
            >
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="px-2 py-1 text-black hover:text-gray-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
} 