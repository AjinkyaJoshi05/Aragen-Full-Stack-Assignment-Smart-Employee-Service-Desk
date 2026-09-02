-- =========================================================
-- Smart Employee Service Desk & Ticket Management Portal
-- Seed Sample Data for SQL Server
-- =========================================================

USE ServiceDeskDB;
GO

-- 1. Seed Categories
IF NOT EXISTS (SELECT 1 FROM Categories)
BEGIN
    INSERT INTO Categories (Name) VALUES 
    (N'IT'),
    (N'HR'),
    (N'Facilities'),
    (N'Finance'),
    (N'Access Management');
END
GO

-- 2. Seed Sample Users
IF NOT EXISTS (SELECT 1 FROM Users)
BEGIN
    INSERT INTO Users (Name, Email, Role) VALUES
    (N'Alice Smith', N'alice.smith@company.com', N'Employee'),
    (N'Bob Jones', N'bob.jones@company.com', N'Support Staff'),
    (N'Carol White', N'carol.white@company.com', N'Manager');
END
GO

-- 3. Seed Sample Tickets (Scenario test cases)
IF NOT EXISTS (SELECT 1 FROM Tickets)
BEGIN
    INSERT INTO Tickets (Title, Description, Category, Priority, Status, CreatedDate) VALUES
    (N'Unable to access VPN while working remotely', N'Client connection times out after entering credentials when attempting remote access.', N'IT', N'High', N'Open', DATEADD(hour, -5, GETDATE())),
    (N'Laptop not booting before a customer presentation', N'Display remains black and power light blinks twice. High urgency.', N'IT', N'High', N'In Progress', DATEADD(hour, -3, GETDATE())),
    (N'Employee requesting leave policy clarification', N'Need details on annual rollover limit for unused PTO days.', N'HR', N'Low', N'Open', DATEADD(day, -1, GETDATE())),
    (N'Access request for a new application', N'Require read/write permission for Jira production board for new project onboarding.', N'Access Management', N'Medium', N'Open', DATEADD(day, -2, GETDATE())),
    (N'Air conditioning issue in office workspace', N'Floor 3 west wing unit is blowing warm air causing discomfort.', N'Facilities', N'Medium', N'In Progress', DATEADD(day, -1, GETDATE())),
    (N'Reimbursement approval pending for more than 30 days', N'Travel expense report #EXP-90214 submitted last month has not been processed.', N'Finance', N'High', N'Resolved', DATEADD(day, -4, GETDATE()));
END
GO

-- 4. Seed Sample Comments / Resolution Notes
IF NOT EXISTS (SELECT 1 FROM Comments)
BEGIN
    DECLARE @Ticket1Id INT = (SELECT TOP 1 TicketId FROM Tickets WHERE Title LIKE N'Laptop not booting%');
    DECLARE @Ticket6Id INT = (SELECT TOP 1 TicketId FROM Tickets WHERE Title LIKE N'Reimbursement approval%');

    IF @Ticket1Id IS NOT NULL
    BEGIN
        INSERT INTO Comments (TicketId, Notes, CreatedDate) VALUES
        (@Ticket1Id, N'Assigned hardware diagnostic specialist to examine motherboard.', DATEADD(hour, -2, GETDATE()));
    END

    IF @Ticket6Id IS NOT NULL
    BEGIN
        INSERT INTO Comments (TicketId, Notes, CreatedDate) VALUES
        (@Ticket6Id, N'Finance manager approved expense. Payment scheduled in next payroll cycle.', DATEADD(day, -3, GETDATE()));
    END
END
GO
