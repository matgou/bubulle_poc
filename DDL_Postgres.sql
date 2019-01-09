
-- DROP TABLE projects;

CREATE TABLE projects
(
  projectid character varying(255) NOT NULL,
  name character varying(255) NOT NULL,
  tags character varying(255)[],
  CONSTRAINT projects_pkey PRIMARY KEY (projectid)
)


-- DROP TABLE components;

CREATE TABLE components
(
  name character varying(255) NOT NULL,
  label character varying(255) NOT NULL,
  type character varying(255),
  projectid character varying(255) NOT NULL,
  "rootObject" boolean DEFAULT false,
  CONSTRAINT components_pk PRIMARY KEY (name, projectid),
  CONSTRAINT composants_projects_fk FOREIGN KEY (projectid)
      REFERENCES public.projects (projectid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)

-- DROP TABLE components_links;

CREATE TABLE components_links
(
  source character varying(255),
  destination character varying(255),
  projectid character varying(255)
)