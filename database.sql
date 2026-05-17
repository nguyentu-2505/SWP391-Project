-- User and Role Management
CREATE TABLE _user (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       username NVARCHAR(255) NOT NULL UNIQUE,
                       password NVARCHAR(255) NOT NULL,
                       email NVARCHAR(255) NOT NULL UNIQUE,
                       role NVARCHAR(50),
                       fpt_student_id NVARCHAR(255),
                       school_name NVARCHAR(255),
                       approved BIT DEFAULT 0,
);

-- Hackathon and related entities
CREATE TABLE hackathon_event (
                                 id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                 name NVARCHAR(255) NOT NULL,
                                 slug NVARCHAR(255) NOT NULL UNIQUE,
                                 description NVARCHAR(MAX),
                                 start_time DATETIME2 NOT NULL,
                                 end_time DATETIME2 NOT NULL,
                                 image_url NVARCHAR(255)
);

CREATE TABLE track (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name NVARCHAR(255) NOT NULL,
                       description NVARCHAR(MAX),
                       hackathon_event_id BIGINT,
                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id)
);

CREATE TABLE round (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name NVARCHAR(255) NOT NULL,
                       description NVARCHAR(MAX),
                       start_time DATETIME2 NOT NULL,
                       end_time DATETIME2 NOT NULL,
                       hackathon_event_id BIGINT,
                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id)
);

-- Team and Submission
CREATE TABLE team (
                      id BIGINT IDENTITY(1,1) PRIMARY KEY,
                      name NVARCHAR(255) NOT NULL UNIQUE,
                      project_name NVARCHAR(255),
                      project_description NVARCHAR(MAX),
                      track_id BIGINT,
                      FOREIGN KEY (track_id) REFERENCES track(id)
);

CREATE TABLE team_member (
                             id BIGINT IDENTITY(1,1) PRIMARY KEY,
                             team_id BIGINT,
                             user_id BIGINT,
                             is_leader BIT,
                             FOREIGN KEY (team_id) REFERENCES team(id),
                             FOREIGN KEY (user_id) REFERENCES _user(id)
);

CREATE TABLE submission (
                            id BIGINT IDENTITY(1,1) PRIMARY KEY,
                            team_id BIGINT NOT NULL,
                            round_id BIGINT NOT NULL,
                            repository_url NVARCHAR(255),
                            demo_url NVARCHAR(255),
                            report_url NVARCHAR(255),
                            submitted_at DATETIME2 DEFAULT GETDATE(),
                            FOREIGN KEY (team_id) REFERENCES team(id),
                            FOREIGN KEY (round_id) REFERENCES round(id)
);

-- Judging and Scoring
CREATE TABLE criterion (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           name NVARCHAR(255) NOT NULL,
                           description NVARCHAR(MAX),
                           weight INT NOT NULL,
                           hackathon_event_id BIGINT,
                           FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id)
);

CREATE TABLE score (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       judge_id BIGINT NOT NULL,
                       submission_id BIGINT NOT NULL,
                       criterion_id BIGINT NOT NULL,
                       score_value INT NOT NULL,
                       comment NVARCHAR(MAX),
                       scored_at DATETIME2 DEFAULT GETDATE(),
                       UNIQUE (judge_id, submission_id, criterion_id),
                       FOREIGN KEY (judge_id) REFERENCES _user(id),
                       FOREIGN KEY (submission_id) REFERENCES submission(id),
                       FOREIGN KEY (criterion_id) REFERENCES criterion(id)
);

-- Prizes and Audit
CREATE TABLE prize (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name NVARCHAR(255) NOT NULL,
                       description NVARCHAR(MAX),
                       hackathon_event_id BIGINT NOT NULL,
                       track_id BIGINT,
                       winning_team_id BIGINT,
                       FOREIGN KEY (hackathon_event_id) REFERENCES hackathon_event(id),
                       FOREIGN KEY (track_id) REFERENCES track(id),
                       FOREIGN KEY (winning_team_id) REFERENCES team(id)
);

CREATE TABLE audit_log (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           user_id BIGINT,
                           action NVARCHAR(255) NOT NULL,
                           details NVARCHAR(MAX),
                           created_at DATETIME2 DEFAULT GETDATE(),
                           FOREIGN KEY (user_id) REFERENCES _user(id)
);
