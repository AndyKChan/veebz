CREATE TABLE players (
    id serial NOT NULL PRIMARY KEY,
    fname VARCHAR (50) NOT NULL,
    lname VARCHAR (50) NOT NULL,
    preferred_position VARCHAR(30) NOT NULL,
    alternative_positions TEXT[],
    gender VARCHAR (2),
    selected BOOLEAN DEFAULT FALSE,
    team INT,
    middle_score INT,
    power_score INT,
    setter_score INT,
    offside_score INT
);

INSERT INTO players(fname, lname, preferred_position, alternative_positions, gender, middle_score, power_score, setter_score, offside_score) VALUES
    ('Andy', 'Chan', 'middle', ARRAY ['power'], 'M', 66, 66, 0 , 0),
    ('Isis', 'Ling', 'power', ARRAY ['offside', 'setter'], 'F', 0, 49, 48, 48),
    ('Dan', 'Hsiao', 'power', ARRAY ['offside', 'middle'], 'M', 46, 47, 0, 47),
    ('Sadie', 'Bui', 'middle', NULL, 'F', 37 ,0, 0, 0),
    ('Vincent', 'Tran', 'middle', ARRAY ['offside', 'power'], 'M', 41, 41, 0, 40),
    ('Mitchell', 'Ma', 'power', ARRAY ['offside', 'middle'], 'M', 66, 69, 0, 68),
    ('Matt', 'Nee', 'setter', ARRAY ['offside', 'middle', 'power'], 'M', 60, 62, 64, 62),
    ('Beka', 'Chen', 'power', ARRAY ['offside'], 'F', 0, 49, 0, 49),
    ('Derek', 'Yip', 'setter', ARRAY ['offside', 'power'], 'M', 0, 51, 53, 51),
    ('Tony', 'Fang', 'middle', ARRAY ['setter', 'offside', 'power'], 'M', 45, 45, 46, 45),
    ('Mark', 'Ho', 'setter', ARRAY ['offside', 'power'], 'M', 0, 36, 39, 36),
    ('Alvin', 'Hatman', 'power', ARRAY ['offside'], 'M', 0, 47, 0, 48),
    ('Gilson', 'Tsang', 'power', ARRAY ['offside'], 'M', 0, 49, 0, 50),
    ('Kevin', 'Chiu', 'middle', ARRAY ['power', 'offside'], 'M', 53, 53, 0, 52),
    ('Connie', 'Cheung', 'power', ARRAY ['offside', 'setter'], 'F', 0, 40, 39, 40),
    ('Hugo', 'Wong', 'setter', ARRAY ['power', 'offside', 'middle'], 'M', 53, 53, 44, 52),
    ('Gorman', '', 'power', ARRAY ['middle', 'setter', 'offside'], 'M', 35, 35, 36, 35),
    ('Kevin', 'Giang', 'power', ARRAY ['offside'], 'M', 0, 55, 0, 54),
    ('Brian', 'Yan', 'middle', ARRAY ['power', 'offside'], 'M', 28, 28, 0, 28);

CREATE TABLE player_skill (
    id serial NOT NULL PRIMARY KEY,
    pid INT NOT NULL,
    blocking INT,
    digging INT,
    receiving INT,
    power_hitting INT,
    middle_hitting INT,
    offside_hitting INT,
    tipping INT,
    serving INT,
    passing INT,
    setting INT,
    middle_score INT,
    power_score INT,
    setter_score INT,
    offside_score INT,
    FOREIGN KEY (pid) REFERENCES players (id)
);

INSERT INTO player_skill(pid, blocking, digging, receiving, power_hitting, middle_hitting, offside_hitting, tipping, serving, passing, setting, middle_score, power_score, setter_score, offside_score ) VALUES
    (1, 10, 9, 9, 10, 10, 9, 9, 9, 10, 6, 66, 66, 0, 0),
    (2, 0, 9, 7, 8, 0, 7, 7, 9, 9, 7, 0, 49, 48, 48),
    (3, 7, 7, 7, 8, 7, 8, 5, 6, 7, 5, 46, 47, 0, 47),
    (4, 5, 5, 5, 6, 6, 6, 4, 6, 6, 5, 37, 0, 0, 0),
    (5, 8, 6, 5, 7, 7, 6, 4, 5, 6, 4, 41, 41, 0, 40),
    (6, 10, 10, 10, 10, 7, 9, 10, 9, 10, 7, 66, 69, 0, 68),
    (7, 6, 10, 10, 8, 6, 8, 10, 9, 9, 10, 60, 62, 64, 62),
    (8, 3, 9, 8, 7, 6, 7, 6, 6, 10, 5, 0, 49, 0, 49),
    (9, 5, 8, 7, 8, 0, 8, 10, 5, 8, 10, 0, 51, 53, 51),
    (10, 10, 7, 6, 6, 6, 6, 5, 5, 6, 7, 45, 45, 46, 45),
    (11, 3, 6, 6, 5, 0, 5, 6, 4, 6, 8, 0, 36, 39, 36),
    (12, 5, 7, 7, 7, 0, 8, 7, 5, 9, 0, 0, 47, 0, 48),
    (13, 7, 6, 7, 7, 0, 8, 8, 7, 7, 0, 0, 49, 0, 50),
    (14, 9, 7, 7, 9, 9, 8, 7, 7, 7, 0, 53, 53, 0, 52),
    (15, 1, 7, 7, 7, 2, 7, 6, 6, 6, 6, 0, 40, 39, 40),
    (16, 9, 7, 7, 9, 9, 8, 7, 7, 7, 0, 53, 53, 44, 52),
    (17, 5, 3, 6, 6, 6, 6, 7, 3, 5, 7, 35, 35, 36, 35),
    (18, 8, 7, 8, 9, 7, 8, 8, 7, 8, 0, 0, 55, 0, 54),
    (19, 6, 3, 3, 5, 5, 5, 3, 5, 3, 4, 28, 28, 0, 28);


