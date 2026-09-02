-- =========================================================
-- Smart Employee Service Desk & Ticket Management Portal
-- Database Schema for Microsoft SQL Server / Azure SQL Database
-- =========================================================

-- 1. Create Database if it does not exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ServiceDeskDB')
BEGIN
    CREATE DATABASE ServiceDeskDB;
END
GO

USE ServiceDeskDB;
GO

-- 2. Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        Role NVARCHAR(50) NOT NULL DEFAULT 'Employee',
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 3. Categories Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        CategoryId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL UNIQUE
    );
END
GO

-- 4. Tickets Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tickets')
BEGIN
    CREATE TABLE Tickets (
        TicketId INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        Category NVARCHAR(50) NOT NULL,
        Priority NVARCHAR(20) NOT NULL CHECK (Priority IN ('High', 'Medium', 'Low')),
        Status NVARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (Status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedByUserId INT NULL FOREIGN KEY REFERENCES Users(UserId),
        AssignedToUserId INT NULL FOREIGN KEY REFERENCES Users(UserId)
    );
END
GO

-- 5. Comments Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Comments')
BEGIN
    CREATE TABLE Comments (
        CommentId INT IDENTITY(1,1) PRIMARY KEY,
        TicketId INT NOT NULL FOREIGN KEY REFERENCES Tickets(TicketId) ON DELETE CASCADE,
        Notes NVARCHAR(MAX) NOT NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO
