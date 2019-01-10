--
-- Bubulle database initialisation
--

--
-- Name: components; Type: TABLE;
--

CREATE TABLE components (
    name character varying(255) NOT NULL,
    label character varying(255) NOT NULL,
    type character varying(255),
    projectid character varying(255) NOT NULL,
    rootobject boolean DEFAULT false
);

--
-- Name: components_links; Type: TABLE; 
--

CREATE TABLE components_links (
    source character varying(255) NOT NULL,
    destination character varying(255) NOT NULL,
    projectid character varying(255) NOT NULL
);

--
-- Name: projects; Type: TABLE; 
--

CREATE TABLE projects (
    projectid character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    tags character varying(255)[]
);

--
-- Data for Name: components; Type: TABLE DATA;
--

COPY components (name, label, type, projectid, rootobject) FROM stdin;
USERS	Utilisateurs	users	Photos	t
NGINX	Reverse proxy	proxy	Photos	f
PHP	Docker PHP	worker	Photos	f
LDAP	LDAP Database	database	Photos	f
MYSQL	MYSQL Database	database	Photos	f
SWIFT	Swift Storage	cloud	Photos	f
FIREWALL	Pare-feu	firewall	Photos	f
FIREWALL	Pare-feu	firewall	VPN	f
USERS	Utilisateurs	users	VPN	t
OPENVPN	OpenVPN	worker	VPN	f
\.


--
-- Data for Name: components_links; Type: TABLE DATA;
--

COPY components_links (source, destination, projectid) FROM stdin;
USERS	FIREWALL	Photos
FIREWALL	NGINX	Photos
NGINX	PHP	Photos
PHP	LDAP	Photos
PHP	MYSQL	Photos
PHP	SWIFT	Photos
USERS	FIREWALL	VPN
FIREWALL	OPENVPN	VPN
\.


--
-- Data for Name: projects; Type: TABLE DATA; 
--

COPY projects (projectid, name, tags) FROM stdin;
Photos	Site des photos	{"site internet"}
VPN	Service VPN	{réseau}
\.


--
-- Name: components_links components_links_pk; Type: CONSTRAINT; 
--

ALTER TABLE ONLY components_links
    ADD CONSTRAINT components_links_pk PRIMARY KEY (source, destination, projectid);


--
-- Name: components components_pk; Type: CONSTRAINT;
--

ALTER TABLE ONLY components
    ADD CONSTRAINT components_pk PRIMARY KEY (name, projectid);


--
-- Name: projects projects_pkey; Type: CONSTRAINT;
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (projectid);


--
-- Name: components_links components_link_source_fk; Type: FK CONSTRAINT;
--

ALTER TABLE ONLY components_links
    ADD CONSTRAINT components_link_source_fk FOREIGN KEY (source, projectid) REFERENCES components(name, projectid);


--
-- Name: components_links components_links_dest_fk; Type: FK CONSTRAINT;
--

ALTER TABLE ONLY components_links
    ADD CONSTRAINT components_links_dest_fk FOREIGN KEY (destination, projectid) REFERENCES components(name, projectid);


--
-- Name: components composants_projects_fk; Type: FK CONSTRAINT; 
--

ALTER TABLE ONLY components
    ADD CONSTRAINT composants_projects_fk FOREIGN KEY (projectid) REFERENCES projects(projectid);