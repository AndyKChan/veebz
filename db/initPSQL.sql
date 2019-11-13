CREATE TABLE players (
    id serial NOT NULL PRIMARY KEY,
    fname VARCHAR (50) NOT NULL,
    lname VARCHAR (50) NOT NULL,
    preferred_position VARCHAR(30) NOT NULL,
    alternative_positions TEXT[],
    gender VARCHAR (2),
    selected BOOLEAN DEFAULT FALSE,
    team INT
);

INSERT INTO players(fname, lname, preferred_position, alternative_positions, gender) VALUES
    ('Andy', 'Chan', 'middle', ARRAY ['power'], 'M'),
    ('Isis', 'Ling', 'power', ARRAY ['offside', 'setter'], 'F'),
    ('Dan', 'Hsiao', 'power', ARRAY ['offside', 'middle'], 'M'),
    ('Sadie', 'Bui', 'middle', NULL, 'F'),
    ('Vincent', 'Tran', 'middle', ARRAY ['offside', 'power'], 'M'),
    ('Mitchell', 'Ma', 'power', ARRAY ['offside', 'middle'], 'M'),
    ('Matt', 'Nee', 'setter', ARRAY ['offside', 'middle', 'power'], 'M'),
    ('Beka', 'Chen', 'power', ARRAY ['offside'], 'F'),
    ('Derek', 'Yip', 'setter', ARRAY ['offside', 'power'], 'M'),
    ('Tony', 'Fang', 'middle', ARRAY ['setter', 'offside', 'power'], 'M'),
    ('Mark', 'Ho', 'setter', ARRAY ['offside', 'power'], 'M'),
    ('Alvin', 'Hatman', 'power', ARRAY ['offside'], 'M'),
    ('Gilson', 'Tsang', 'power', ARRAY ['offside'], 'M'),
    ('Kevin', 'Chiu', 'middle', ARRAY ['power', 'offside'], 'M'),
    ('Connie', 'Cheung', 'power', ARRAY ['offside', 'setter'], 'F'),
    ('Hugo', 'Wong', 'setter', ARRAY ['power', 'offside', 'middle'], 'M');

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
    FOREIGN KEY (pid) REFERENCES players (id)
);

INSERT INTO player_skill(pid, blocking, digging, receiving, power_hitting, middle_hitting, offside_hitting, tipping, serving, passing, setting) VALUES
    (1, 10, 9, 9, 10, 10, 9, 9, 9, 10, 6),
    (2, 0, 9, 7, 8, null, 7, 7, 9, 9, 7),
    (3, 7, 7, 7, 8, 7, 8, 5, 6, 7, 5),
    (4, 5, 5, 5, 6, 6, 6, 4, 6, 6, 5),
    (5, 8, 6, 5, 7, 7, 6, 4, 5, 6, 4),
    (6, 10, 10, 10, 10, 7, 9, 10, 9, 10, 7),
    (7, 6, 10, 10, 8, 6, 8, 10, 9, 9, 10),
    (8, 3, 9, 8, 7, 6, 7, 6, 6, 10, 5),
    (9, 5, 8, 7, 8, null, 8, 10, 5, 8, 10),
    (10, 10, 7, 6, 6, 6, 6, 5, 5, 6, 7),
    (11, 3, 6, 6, 5, null, 5, 6, 4, 6, 8),
    (12, 5, 7, 7, 7, null, 8, 7, 5, 9, null),
    (13, 7, 6, 7, 7, null, 8, 8, 7, 7, null),
    (14, 9, 7, 7, 9, 9, 8, 7, 7, 7, null);
    -- ('15', '', '', '', '', '', '', '', '', '', ''),
    -- ('16', '', '', '', '', '', '', '', '', '', '');


