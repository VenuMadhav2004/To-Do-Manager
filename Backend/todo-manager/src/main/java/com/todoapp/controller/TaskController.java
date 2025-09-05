package com.todoapp.controller;

import com.todoapp.entity.Task;
import com.todoapp.entity.User;
import com.todoapp.service.TaskService;
import com.todoapp.service.UserService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.security.Key;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(@RequestHeader("Authorization") String token) {
        User user = getUserFromToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Task> tasks = taskService.getAllTasksForUser(user);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/completed")
    public ResponseEntity<List<Task>> getCompletedTasks(@RequestHeader("Authorization") String token) {
        User user = getUserFromToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Task> tasks = taskService.getCompletedTasksForUser(user);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Task>> getPendingTasks(@RequestHeader("Authorization") String token) {
        User user = getUserFromToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Task> tasks = taskService.getPendingTasksForUser(user);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task, @RequestHeader("Authorization") String token) {
        User user = getUserFromToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        task.setUser(user);
        Task createdTask = taskService.createTask(task);
        return ResponseEntity.ok(createdTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task taskDetails, @RequestHeader("Authorization") String token) {
        User user = getUserFromToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Task> taskOptional = taskService.getTaskById(id);
        if (taskOptional.isPresent()) {
            Task task = taskOptional.get();
            if (!task.getUser().getId().equals(user.getId()))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            task.setTitle(taskDetails.getTitle());
            task.setDueDate(taskDetails.getDueDate());
            task.setPriority(taskDetails.getPriority());

            Task updatedTask = taskService.updateTask(task);
            return ResponseEntity.ok(updatedTask);
        }

        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Task> markTaskComplete(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        User user = getUserFromToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Task> taskOptional = taskService.getTaskById(id);
        if (taskOptional.isPresent()) {
            Task task = taskOptional.get();
            if (!task.getUser().getId().equals(user.getId()))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            task.setCompleted(true);
            Task updatedTask = taskService.updateTask(task);
            return ResponseEntity.ok(updatedTask);
        }

        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        User user = getUserFromToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Task> taskOptional = taskService.getTaskById(id);
        if (taskOptional.isPresent()) {
            Task task = taskOptional.get();
            if (!task.getUser().getId().equals(user.getId()))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            taskService.deleteTask(id);
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.notFound().build();
    }

    private User getUserFromToken(String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

            String username = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody()
                    .getSubject();

            return userService.findByUsername(username).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
