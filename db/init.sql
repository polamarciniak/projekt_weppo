SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;
SET lc_time TO 'pl_PL.utf8';

SET default_tablespace = '';

SET default_with_oids = false;

CREATE TABLE account (
  id serial NOT NULL,
  username varchar(20) NOT NULL,
  password text NOT NULL,
  isadmin boolean NOT NULL,
  last_login timestamp
);

CREATE TABLE purchase (
  id serial NOT NULL,
  userid integer NOT NULL,
  status integer NOT NULL
);

CREATE TABLE purchase_status (
  id serial NOT NULL,
  description text
);

CREATE TABLE sold_product (
  purchase_id integer NOT NULL,
  product_id integer NOT NULL,
  amount integer NOT NULL
);

CREATE TABLE product (
  id serial NOT NULL,
  price numeric NOT NULL,
  name text NOT NULL,
  size integer,
  colour integer,
  amount integer NOT NULL,
  status boolean NOT NULL,
  description text,
  category integer
);

CREATE TABLE size (
  id serial NOT NULL,
  description text
);

CREATE TABLE colour (
  id serial NOT NULL,
  description text
);

CREATE TABLE category (
  id serial NOT NULL,
  description text
);

ALTER TABLE account
  ADD CONSTRAINT account_key PRIMARY KEY (id);

ALTER TABLE purchase
  ADD CONSTRAINT purchase_key PRIMARY KEY (id);

ALTER TABLE purchase_status
  ADD CONSTRAINT purchase_status_key PRIMARY KEY (id);

ALTER TABLE sold_product
  ADD CONSTRAINT sold_product_key PRIMARY KEY (purchase_id, product_id);

ALTER TABLE product
  ADD CONSTRAINT product_key PRIMARY KEY (id);

ALTER TABLE size
  ADD CONSTRAINT size_key PRIMARY KEY (id);

ALTER TABLE colour
  ADD CONSTRAINT colour_key PRIMARY KEY (id);

ALTER TABLE category
  ADD CONSTRAINT category_key PRIMARY KEY (id);

ALTER TABLE purchase
    ADD CONSTRAINT fk_purchase FOREIGN KEY (userid) REFERENCES account(id) DEFERRABLE;

ALTER TABLE sold_product
    ADD CONSTRAINT fk_sold_product_purchase FOREIGN KEY (purchase_id) REFERENCES purchase(id);

ALTER TABLE sold_product
    ADD CONSTRAINT fk_sold_product_prod FOREIGN KEY (product_id) REFERENCES product(id);

ALTER TABLE product
    ADD CONSTRAINT fk_product_size FOREIGN KEY (size) REFERENCES size(id);

ALTER TABLE product
    ADD CONSTRAINT fk_product_colour FOREIGN KEY (colour) REFERENCES colour(id);

ALTER TABLE product
    ADD CONSTRAINT fk_product_category FOREIGN KEY (category) REFERENCES category(id);
