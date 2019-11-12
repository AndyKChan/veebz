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
    ('Alvin', '', 'power', ARRAY ['offside', 'middle'], 'M');
