package com.todoapp.service;

import com.todoapp.entity.Task;
import com.todoapp.entity.User;
import com.todoapp.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    public List<Task> getAllTasksForUser(User user) {
        return taskRepository.findByUser(user);
    }
    
    public List<Task> getCompletedTasksForUser(User user) {
        return taskRepository.findByUserAndCompleted(user, true);
    }
    
    public List<Task> getPendingTasksForUser(User user) {
        return taskRepository.findByUserAndCompleted(user, false);
    }
    
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }
    
    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }
    
    public Task updateTask(Task task) {
        return taskRepository.save(task);
    }
    
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}