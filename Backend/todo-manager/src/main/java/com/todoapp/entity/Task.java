package com.todoapp.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    private LocalDate dueDate;
    
    @Enumerated(EnumType.STRING)
    private Priority priority;
    
    private boolean completed = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    // Constructors
    public Task() {}
    
    public Task(String title, LocalDate dueDate, Priority priority, User user) {
        this.title = title;
        this.dueDate = dueDate;
        this.priority = priority;
        this.user = user;
    }
    
    // Priority Enum
    public enum Priority {
        HIGH, MEDIUM, LOW
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}