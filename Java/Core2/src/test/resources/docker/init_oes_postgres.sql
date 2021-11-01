CREATE USER oes WITH
  LOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  encrypted password 'oes';
  
CREATE SCHEMA oes
    AUTHORIZATION oes;