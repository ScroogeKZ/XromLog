--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: shipment_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shipment_requests (
    id integer NOT NULL,
    request_number character varying(255) NOT NULL,
    category character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'new'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone,
    created_by_user_id integer,
    cargo_name character varying(255) NOT NULL,
    cargo_weight_kg numeric(10,2),
    cargo_volume_m3 numeric(10,2),
    cargo_dimensions character varying(255),
    special_requirements text,
    loading_city character varying(255),
    loading_address text NOT NULL,
    loading_contact_person character varying(255),
    loading_contact_phone character varying(20),
    unloading_city character varying(255),
    unloading_address text NOT NULL,
    unloading_contact_person character varying(255),
    unloading_contact_phone character varying(20),
    desired_shipment_datetime timestamp with time zone,
    notes text,
    cargo_photos text[],
    transport_info jsonb,
    price_kzt numeric(10,2),
    price_notes text,
    client_name text,
    client_phone text,
    client_email text
);


ALTER TABLE public.shipment_requests OWNER TO neondb_owner;

--
-- Name: shipment_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.shipment_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shipment_requests_id_seq OWNER TO neondb_owner;

--
-- Name: shipment_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shipment_requests_id_seq OWNED BY public.shipment_requests.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password text NOT NULL,
    role character varying(50) DEFAULT 'employee'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: shipment_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_requests ALTER COLUMN id SET DEFAULT nextval('public.shipment_requests_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: shipment_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shipment_requests (id, request_number, category, status, created_at, updated_at, created_by_user_id, cargo_name, cargo_weight_kg, cargo_volume_m3, cargo_dimensions, special_requirements, loading_city, loading_address, loading_contact_person, loading_contact_phone, unloading_city, unloading_address, unloading_contact_person, unloading_contact_phone, desired_shipment_datetime, notes, cargo_photos, transport_info, price_kzt, price_notes, client_name, client_phone, client_email) FROM stdin;
1	AST-2025-001	astana	new	2025-08-05 06:06:24.609135+00	2025-08-05 06:06:24.59+00	1	Тестовый груз	\N	\N	\N	\N	\N	ул. Тестовая 1	\N	\N	\N	ул. Тестовая 2	\N	\N	\N	\N	\N	\N	\N	\N	Тест Тестов	+77001234567	\N
2	INT-2025-001	intercity	processing	2025-08-05 06:06:45.456+00	2025-08-05 06:29:06.045+00	1	Тестовый груз 2	\N	\N	\N	\N	\N	ул. Тестовая 10, Алматы	\N	\N	\N	ул. Тестовая 20, Астана	\N	\N	\N	\N	\N	{"driverName": null, "driverPhone": null, "vehicleModel": null, "vehiclePlate": null}	100000.00	\N	\N	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, role, created_at) FROM stdin;
1	admin	$2b$10$ZnguFtxk3fHMv7kIgK4HGOE26ChhHJrhcCklTp5Z1xx3BcO2MOGd2	manager	2025-08-05 06:05:53.889906+00
2	testuser	$2b$10$MJh55w2xYQJMtmqQwhH8u.Zx3mkqSnKnNAnNUlTsd0psdcnn7bbBq	employee	2025-08-05 06:31:26.46173+00
3	kolya	$2b$10$sJDstTZ9psV/I14ZnjRcMukDyxjJGgprEdUFH8tJqQRyBT1dQkGFq	employee	2025-08-05 06:33:39.761097+00
\.


--
-- Name: shipment_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shipment_requests_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: shipment_requests shipment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_requests
    ADD CONSTRAINT shipment_requests_pkey PRIMARY KEY (id);


--
-- Name: shipment_requests shipment_requests_request_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_requests
    ADD CONSTRAINT shipment_requests_request_number_unique UNIQUE (request_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: shipment_requests shipment_requests_created_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shipment_requests
    ADD CONSTRAINT shipment_requests_created_by_user_id_users_id_fk FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

