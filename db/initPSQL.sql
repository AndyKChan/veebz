CREATE TABLE players (
    id serial NOT NULL PRIMARY KEY,
    fname VARCHAR (50) NOT NULL,
    lname VARCHAR (50) NOT NULL,
    preferred_position VARCHAR(30) NOT NULL,
    alternate_positions TEXT[],
    selected BOOLEAN DEFAULT FALSE,
    team INT
);

INSERT INTO players(fname, lname, preferred_position, alternate_positions) VALUES
    ('Andy', 'Chan', 'middle', ARRAY ['power']),
    ('Isis', 'Ling', 'power', ARRAY ['offside', 'setter']),
    ('Dan', 'Hsiao', 'power', ARRAY ['offside', 'middle']),
    ('Sadie', 'Bui', 'middle', NULL),
    ('Vincent', 'Tran', 'middle', ARRAY ['offside', 'power']),
    ('Mitchell', 'Ma', 'power', ARRAY ['offside', 'middle']),
    ('Matt', 'Nee', 'setter', ARRAY ['offside', 'middle', 'power']),
    ('Beka', 'Chen', 'power', ARRAY ['offside']),
    ('Derek', 'Yip', 'setter', ARRAY ['offside', 'power']),
    ('Tony', 'Fang', 'middle', ARRAY ['setter', 'offside', 'power']),
    ('Mark', 'Ho', 'setter', ARRAY ['offside', 'power']),
    ('Alvin', '', 'power', ARRAY ['offside', 'middle']);
