--
-- PostgreSQL database dump
--

\restrict BAJQFEoDtAA8KCDGTHqnSmNpFrfZD0mYAScaNWYktdkIL7t85hJHOOEwUHiZxl4

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

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

--
-- Name: assessmentstatus; Type: TYPE; Schema: public; Owner: devops
--

CREATE TYPE public.assessmentstatus AS ENUM (
    'DRAFT',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE public.assessmentstatus OWNER TO devops;

--
-- Name: domaintype; Type: TYPE; Schema: public; Owner: devops
--

CREATE TYPE public.domaintype AS ENUM (
    'DOMAIN1',
    'DOMAIN2',
    'DOMAIN3',
    'DOMAIN4',
    'DOMAIN5'
);


ALTER TYPE public.domaintype OWNER TO devops;

--
-- Name: organizationsize; Type: TYPE; Schema: public; Owner: devops
--

CREATE TYPE public.organizationsize AS ENUM (
    'SMALL',
    'MEDIUM',
    'LARGE',
    'ENTERPRISE'
);


ALTER TYPE public.organizationsize OWNER TO devops;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: devops
--

CREATE TYPE public.userrole AS ENUM (
    'ADMIN',
    'ASSESSOR',
    'VIEWER'
);


ALTER TYPE public.userrole OWNER TO devops;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: devops
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO devops;

--
-- Name: assessments; Type: TABLE; Schema: public; Owner: devops
--

CREATE TABLE public.assessments (
    id uuid NOT NULL,
    team_name character varying(255) NOT NULL,
    status public.assessmentstatus DEFAULT 'DRAFT'::public.assessmentstatus NOT NULL,
    overall_score double precision,
    maturity_level integer,
    assessor_id uuid NOT NULL,
    organization_id uuid,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.assessments OWNER TO devops;

--
-- Name: domain_scores; Type: TABLE; Schema: public; Owner: devops
--

CREATE TABLE public.domain_scores (
    id uuid NOT NULL,
    assessment_id uuid NOT NULL,
    domain public.domaintype NOT NULL,
    score double precision NOT NULL,
    maturity_level integer NOT NULL,
    strengths character varying[],
    gaps character varying[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.domain_scores OWNER TO devops;

--
-- Name: gate_responses; Type: TABLE; Schema: public; Owner: devops
--

CREATE TABLE public.gate_responses (
    id uuid NOT NULL,
    assessment_id uuid NOT NULL,
    domain public.domaintype NOT NULL,
    gate_id character varying(50) NOT NULL,
    question_id character varying(50) NOT NULL,
    score integer NOT NULL,
    notes text,
    evidence character varying[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gate_responses OWNER TO devops;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: devops
--

CREATE TABLE public.organizations (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    industry character varying(255),
    size public.organizationsize,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.organizations OWNER TO devops;

--
-- Name: users; Type: TABLE; Schema: public; Owner: devops
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    full_name character varying(255),
    role public.userrole NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    organization_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO devops;

--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: devops
--

COPY public.alembic_version (version_num) FROM stdin;
2d801ad1aac1
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: devops
--

COPY public.assessments (id, team_name, status, overall_score, maturity_level, assessor_id, organization_id, started_at, completed_at, created_at, updated_at) FROM stdin;
5aafd9fd-702e-4d55-bf93-252ba059d06d	Test team	COMPLETED	60	3	6f411232-19f8-41b1-b8cc-f63a85a88111	156b3892-3c64-444f-834f-bf11502dab2a	2025-10-08 01:04:20.991414	2025-10-08 01:05:28.140952	2025-10-08 01:04:20.992702	2025-10-08 01:05:28.140958
9cd9d56c-24b3-4d96-9323-ecbe4bcd8f14	Test Team	DRAFT	\N	\N	6f411232-19f8-41b1-b8cc-f63a85a88111	\N	2025-10-08 18:18:20.215387	\N	2025-10-08 18:18:20.226063	2025-10-08 18:18:20.226083
240ea61f-6909-44da-aa18-67344ce7d3c3	Test Team Full Flow	COMPLETED	45.5	3	6f411232-19f8-41b1-b8cc-f63a85a88111	\N	2025-10-08 18:19:38.588627	2025-10-08 18:20:11.400053	2025-10-08 18:19:38.589073	2025-10-08 18:20:11.400058
de385933-c9ae-4de5-adb1-657a480d9541	Fresh Start Test	DRAFT	\N	\N	6f411232-19f8-41b1-b8cc-f63a85a88111	\N	2025-10-15 03:30:08.55192	\N	2025-10-15 03:30:08.601708	2025-10-15 03:30:08.601712
7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	Complete Workflow Test	COMPLETED	51	3	6f411232-19f8-41b1-b8cc-f63a85a88111	\N	2025-10-15 03:30:35.616873	2025-10-15 03:30:36.121377	2025-10-15 03:30:35.617479	2025-10-15 03:30:36.121382
c54f1353-682d-44ea-bcd2-5b2ae8969a2e	Final Test	COMPLETED	60	3	6f411232-19f8-41b1-b8cc-f63a85a88111	\N	2025-10-15 03:31:01.482935	2025-10-15 03:31:01.656865	2025-10-15 03:31:01.483301	2025-10-15 03:31:01.656869
746eeda6-89f2-4642-8260-5ec6638e9f0f	are we ready to upload this to docker?	DRAFT	\N	\N	6f411232-19f8-41b1-b8cc-f63a85a88111	156b3892-3c64-444f-834f-bf11502dab2a	2025-11-24 03:03:46.929286	\N	2025-11-24 03:03:46.929681	2025-11-24 03:03:46.929681
1f4d348b-87c2-4ad4-a8d9-c5ff21290de0	Curl Test Team	DRAFT	\N	\N	6f411232-19f8-41b1-b8cc-f63a85a88111	156b3892-3c64-444f-834f-bf11502dab2a	2025-11-26 22:30:32.556111	\N	2025-11-26 22:30:32.572899	2025-11-26 22:30:32.572902
\.


--
-- Data for Name: domain_scores; Type: TABLE DATA; Schema: public; Owner: devops
--

COPY public.domain_scores (id, assessment_id, domain, score, maturity_level, strengths, gaps, created_at, updated_at) FROM stdin;
e7d0cd01-1f3d-48e4-8fe3-016181dbadea	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN1	60	3	{}	{}	2025-10-08 01:05:28.143192	2025-10-08 01:05:28.143194
cca5fdad-e622-49b1-bdcb-fb3702e9e1f2	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN2	60	3	{}	{}	2025-10-08 01:05:28.143197	2025-10-08 01:05:28.143197
c1a42d39-e54f-4f23-a33e-afeb7cebb45f	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN3	60	3	{}	{}	2025-10-08 01:05:28.143199	2025-10-08 01:05:28.143199
0c9a918e-66cd-4e36-a7e2-dca6a25bf037	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN4	60	3	{}	{}	2025-10-08 01:05:28.143201	2025-10-08 01:05:28.143201
e3a98acf-43ee-4efd-992d-595ff36af8e0	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN5	60	3	{}	{}	2025-10-08 01:05:28.143202	2025-10-08 01:05:28.143203
55cc5eef-b1e7-43a5-aaa7-f388ff8f8cc3	240ea61f-6909-44da-aa18-67344ce7d3c3	DOMAIN1	70	4	{"Version Control & Branching - Qq1: Score 4/5"}	{}	2025-10-08 18:20:11.409518	2025-10-08 18:20:11.409536
80c04e9f-c419-4ade-8761-89d1535927db	240ea61f-6909-44da-aa18-67344ce7d3c3	DOMAIN2	60	3	{}	{}	2025-10-08 18:20:11.409543	2025-10-08 18:20:11.409543
2e0ecd98-0b7a-45a9-86e5-483e299f2ec5	240ea61f-6909-44da-aa18-67344ce7d3c3	DOMAIN3	80	4	{"Continuous Integration - Qq1: Score 4/5"}	{}	2025-10-08 18:20:11.409546	2025-10-08 18:20:11.409546
842a2d03-9fc5-4ddf-9b0d-6382af0d795b	240ea61f-6909-44da-aa18-67344ce7d3c3	DOMAIN4	0	1	{}	{}	2025-10-08 18:20:11.409548	2025-10-08 18:20:11.409548
f3ed2342-bea7-462f-bca8-12ced1f8cdda	240ea61f-6909-44da-aa18-67344ce7d3c3	DOMAIN5	0	1	{}	{}	2025-10-08 18:20:11.409549	2025-10-08 18:20:11.40955
1eb75405-9efe-47a6-9efb-b61f56d7a706	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN1	90	5	{"Version Control & Branching - Qq1: Score 5/5","Version Control & Branching - Qq2: Score 4/5"}	{}	2025-10-15 03:30:36.125199	2025-10-15 03:30:36.125202
d5b8a659-dc88-4241-b32e-1455f1ff5ee1	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN2	60	3	{}	{}	2025-10-15 03:30:36.125204	2025-10-15 03:30:36.125204
9fff8116-63fa-4035-b4f2-efd807f193a3	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN3	90	5	{"Continuous Integration - Qq1: Score 5/5","Continuous Integration - Qq2: Score 4/5"}	{}	2025-10-15 03:30:36.125206	2025-10-15 03:30:36.125207
db4761eb-af1a-4926-be1d-88d49d11b5b1	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN4	0	1	{}	{}	2025-10-15 03:30:36.125208	2025-10-15 03:30:36.125209
5d3829b2-0e6c-450a-9fb5-233de995f77a	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN5	0	1	{}	{}	2025-10-15 03:30:36.12521	2025-10-15 03:30:36.125211
9a1a02e1-968a-45b7-8033-05b45b9b871b	c54f1353-682d-44ea-bcd2-5b2ae8969a2e	DOMAIN1	100	5	{"Version Control & Branching - Qq1: Score 5/5"}	{}	2025-10-15 03:31:01.657718	2025-10-15 03:31:01.65772
27aa628d-f8c4-468f-a69a-dd8eecc6e9f3	c54f1353-682d-44ea-bcd2-5b2ae8969a2e	DOMAIN2	80	4	{"Security Scanning & Vulnerability Management - Qq1: Score 4/5"}	{}	2025-10-15 03:31:01.657722	2025-10-15 03:31:01.657723
694ebbeb-0afb-4f16-9e68-93768a1d0d6f	c54f1353-682d-44ea-bcd2-5b2ae8969a2e	DOMAIN3	100	5	{"Continuous Integration - Qq1: Score 5/5"}	{}	2025-10-15 03:31:01.657724	2025-10-15 03:31:01.657724
0b532b3b-0cfd-4550-ae57-c014ef0a276c	c54f1353-682d-44ea-bcd2-5b2ae8969a2e	DOMAIN4	0	1	{}	{}	2025-10-15 03:31:01.657726	2025-10-15 03:31:01.657726
8a609de4-deb8-4a49-bb58-d2cd3fa9e5f9	c54f1353-682d-44ea-bcd2-5b2ae8969a2e	DOMAIN5	0	1	{}	{}	2025-10-15 03:31:01.657728	2025-10-15 03:31:01.657729
\.


--
-- Data for Name: gate_responses; Type: TABLE DATA; Schema: public; Owner: devops
--

COPY public.gate_responses (id, assessment_id, domain, gate_id, question_id, score, notes, evidence, created_at, updated_at) FROM stdin;
9e8cbe71-c6f4-459e-b1b7-41550e84c5f9	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN1	gate_1_1	q1	3	\N	{}	2025-10-08 01:05:24.34399	2025-10-08 01:05:24.343993
49327066-44f3-4816-9232-57b9cee943c9	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN1	gate_1_1	q2	3	\N	{}	2025-10-08 01:05:24.343995	2025-10-08 01:05:24.343996
671c0805-ae76-4e18-a0e5-84c4f533ecc7	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN1	gate_1_2	q1	3	\N	{}	2025-10-08 01:05:24.343997	2025-10-08 01:05:24.343998
e5f7c37c-addb-4920-b7ab-b2046d311353	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN1	gate_1_2	q2	3	\N	{}	2025-10-08 01:05:24.344	2025-10-08 01:05:24.344
7fcf1a05-7b8d-4cb3-a497-ff4ae9bdd558	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN1	gate_1_3	q1	3	\N	{}	2025-10-08 01:05:24.344002	2025-10-08 01:05:24.344002
547d507c-427a-4b9b-8247-7da7e1ade2e4	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN1	gate_1_3	q2	3	\N	{}	2025-10-08 01:05:24.344003	2025-10-08 01:05:24.344003
a61483b7-0049-431f-ab2f-76be4e7d0abe	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN1	gate_1_4	q1	3	\N	{}	2025-10-08 01:05:24.344005	2025-10-08 01:05:24.344006
4fa5cfb1-d80d-4bed-b0ce-5cea817d3aab	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN1	gate_1_4	q2	3	\N	{}	2025-10-08 01:05:24.344007	2025-10-08 01:05:24.344007
2b5e0f16-84dc-447d-b394-5a603c0a5a0b	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN2	gate_2_1	q1	3	\N	{}	2025-10-08 01:05:24.344009	2025-10-08 01:05:24.344009
e9200534-bdda-4b72-8153-3e61c8a80a21	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN2	gate_2_1	q2	3	\N	{}	2025-10-08 01:05:24.344011	2025-10-08 01:05:24.344011
cd70bb2b-959e-40f0-a426-1c4892a3c4b9	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN2	gate_2_2	q1	3	\N	{}	2025-10-08 01:05:24.344012	2025-10-08 01:05:24.344013
65a8fc65-5b2f-46cd-920d-a1b6ec8c023d	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN2	gate_2_2	q2	3	\N	{}	2025-10-08 01:05:24.344014	2025-10-08 01:05:24.344014
e4b2b42c-f388-40f1-b723-1b8002c32176	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN2	gate_2_3	q1	3	\N	{}	2025-10-08 01:05:24.344016	2025-10-08 01:05:24.344016
b0b560ef-4576-4d1e-bf52-b17acc442c82	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN2	gate_2_3	q2	3	\N	{}	2025-10-08 01:05:24.344017	2025-10-08 01:05:24.344018
731d7bd7-8768-47fc-a512-88c94f6e7229	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN2	gate_2_4	q1	3	\N	{}	2025-10-08 01:05:24.344019	2025-10-08 01:05:24.344019
dde4305e-2651-436d-98d4-a7ba77f249b4	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN2	gate_2_4	q2	3	\N	{}	2025-10-08 01:05:24.344021	2025-10-08 01:05:24.344021
f0ae36f5-455c-44e5-8545-d408b47a728a	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN3	gate_3_1	q1	3	\N	{}	2025-10-08 01:05:24.344022	2025-10-08 01:05:24.344023
a590d30e-9779-43fc-95cb-26cc15e18a21	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN3	gate_3_1	q2	3	\N	{}	2025-10-08 01:05:24.344024	2025-10-08 01:05:24.344024
a43ef4cb-257a-46cc-bf14-13fbda85de8c	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN3	gate_3_2	q1	3	\N	{}	2025-10-08 01:05:24.344026	2025-10-08 01:05:24.344026
fec47e16-29c5-4f71-bb7c-7e4f891fcba5	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN3	gate_3_2	q2	3	\N	{}	2025-10-08 01:05:24.344027	2025-10-08 01:05:24.344028
8fb070a4-4d84-43de-b9db-9e16da99c9a0	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN3	gate_3_3	q1	3	\N	{}	2025-10-08 01:05:24.344029	2025-10-08 01:05:24.344029
385a834a-0e57-4e68-b5bc-61632d226d00	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN3	gate_3_3	q2	3	\N	{}	2025-10-08 01:05:24.344031	2025-10-08 01:05:24.344031
6e6aee48-a840-47d6-a33f-f381cc97a323	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN3	gate_3_4	q1	3	\N	{}	2025-10-08 01:05:24.344032	2025-10-08 01:05:24.344032
2f2b54c3-239d-45bb-abcf-c3630e7123fb	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN3	gate_3_4	q2	3	\N	{}	2025-10-08 01:05:24.344034	2025-10-08 01:05:24.344034
9b102d6f-01b4-4785-9193-29eb7a2be76a	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN4	gate_4_1	q1	3	\N	{}	2025-10-08 01:05:24.344036	2025-10-08 01:05:24.344036
144d349d-14aa-4a1f-989b-3057eb6d5a60	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN4	gate_4_1	q2	3	\N	{}	2025-10-08 01:05:24.344037	2025-10-08 01:05:24.344038
b954ef8d-caba-4395-b66f-554635405b7d	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN4	gate_4_2	q1	3	\N	{}	2025-10-08 01:05:24.344039	2025-10-08 01:05:24.344039
8df42f14-3b77-4faf-8c13-282a610e0052	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN4	gate_4_2	q2	3	\N	{}	2025-10-08 01:05:24.344041	2025-10-08 01:05:24.344041
115bd9b6-c660-4d10-8b63-f7d70f594565	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN4	gate_4_3	q1	3	\N	{}	2025-10-08 01:05:24.344042	2025-10-08 01:05:24.344043
e8e67d61-d208-4363-aafa-a2c30da20fba	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN4	gate_4_3	q2	3	\N	{}	2025-10-08 01:05:24.344044	2025-10-08 01:05:24.344044
6980d8c5-9c26-465b-9db5-e8e9feec1a94	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN4	gate_4_4	q1	3	\N	{}	2025-10-08 01:05:24.344046	2025-10-08 01:05:24.344046
d34b4302-93b7-4878-b1fe-61174df4a187	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN4	gate_4_4	q2	3	\N	{}	2025-10-08 01:05:24.344048	2025-10-08 01:05:24.344048
b1690745-1441-4da1-b37a-16827a312088	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN5	gate_5_1	q1	3	\N	{}	2025-10-08 01:05:24.344049	2025-10-08 01:05:24.344049
0602213c-14f4-40b0-a916-8ddc1d75b045	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN5	gate_5_1	q2	3	\N	{}	2025-10-08 01:05:24.344051	2025-10-08 01:05:24.344051
0aecd400-5b37-4cbf-9685-bbaf17facbb2	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN5	gate_5_2	q1	3	\N	{}	2025-10-08 01:05:24.344053	2025-10-08 01:05:24.344053
4d05e67a-d800-43c7-9908-37da31d901cc	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN5	gate_5_2	q2	3	\N	{}	2025-10-08 01:05:24.344054	2025-10-08 01:05:24.344054
d6e944a8-8d4c-41d2-9c14-876f41eab70f	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN5	gate_5_3	q1	3	\N	{}	2025-10-08 01:05:24.344056	2025-10-08 01:05:24.344056
2d6ba1d0-2d5c-4cfa-bc99-baf71abe3fda	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN5	gate_5_3	q2	3	\N	{}	2025-10-08 01:05:24.344058	2025-10-08 01:05:24.344058
bb62f93a-502c-4690-bf98-0ab4e2360220	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN5	gate_5_4	q1	3	\N	{}	2025-10-08 01:05:24.344059	2025-10-08 01:05:24.344059
052bdb1d-c74c-4570-b9cd-a997b2ed898b	5aafd9fd-702e-4d55-bf93-252ba059d06d	DOMAIN5	gate_5_4	q2	3	\N	{}	2025-10-08 01:05:24.344061	2025-10-08 01:05:24.344061
45b58a66-e3a7-403b-aa03-cfc691574895	240ea61f-6909-44da-aa18-67344ce7d3c3	DOMAIN1	gate_1_1	q1	4	Good version control	{}	2025-10-08 18:20:02.10188	2025-10-08 18:20:02.101883
062cd7b0-6350-4b03-b3b5-9f40e8a84904	240ea61f-6909-44da-aa18-67344ce7d3c3	DOMAIN1	gate_1_1	q2	3	Decent branching	{}	2025-10-08 18:20:02.101889	2025-10-08 18:20:02.10189
44b42eb9-d324-4a78-9922-9eed82e66bd3	240ea61f-6909-44da-aa18-67344ce7d3c3	DOMAIN2	gate_2_1	q1	3	Security scanning in place	{}	2025-10-08 18:20:02.101892	2025-10-08 18:20:02.101892
2a525b9a-a6a8-48fd-b251-ab241a08de99	240ea61f-6909-44da-aa18-67344ce7d3c3	DOMAIN3	gate_3_1	q1	4	Strong CI	{}	2025-10-08 18:20:02.101894	2025-10-08 18:20:02.101894
89d64582-b3b3-4fd7-a992-c2098a0a2d57	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN1	gate_1_1	q1	5	Excellent version control	{}	2025-10-15 03:30:35.98889	2025-10-15 03:30:35.988893
61670fa1-6bb4-4caa-a47f-711b5135b37a	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN1	gate_1_1	q2	4	Good branching strategy	{}	2025-10-15 03:30:35.988896	2025-10-15 03:30:35.988896
7bcfe741-b8d1-475d-b070-a40cb6a3a451	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN2	gate_2_1	q1	3	Security scanning present	{}	2025-10-15 03:30:35.988898	2025-10-15 03:30:35.988899
689bc876-77e2-438f-815a-7b6da003b15b	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN2	gate_2_1	q2	3	Vulnerability tracking	{}	2025-10-15 03:30:35.9889	2025-10-15 03:30:35.988901
085a87f2-8f7f-4ab1-a4b8-efe99ab287e5	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN3	gate_3_1	q1	5	Excellent CI pipeline	{}	2025-10-15 03:30:35.988902	2025-10-15 03:30:35.988902
72f171e7-8bab-4b12-ab4b-c031f51f3b99	7d84f6e8-a1e0-4069-958b-dadb1b5b8cac	DOMAIN3	gate_3_1	q2	4	Frequent integration	{}	2025-10-15 03:30:35.988904	2025-10-15 03:30:35.988905
1db5df74-6d29-45f6-aa4d-b460467e4a64	c54f1353-682d-44ea-bcd2-5b2ae8969a2e	DOMAIN1	gate_1_1	q1	5	\N	{}	2025-10-15 03:31:01.594772	2025-10-15 03:31:01.594774
e9e40f15-a900-43be-8758-41a7942e89cd	c54f1353-682d-44ea-bcd2-5b2ae8969a2e	DOMAIN2	gate_2_1	q1	4	\N	{}	2025-10-15 03:31:01.594776	2025-10-15 03:31:01.594777
47d9995b-5d75-44e9-a28c-94bba9ce9bc5	c54f1353-682d-44ea-bcd2-5b2ae8969a2e	DOMAIN3	gate_3_1	q1	5	\N	{}	2025-10-15 03:31:01.594778	2025-10-15 03:31:01.594779
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: devops
--

COPY public.organizations (id, name, industry, size, created_at, updated_at) FROM stdin;
156b3892-3c64-444f-834f-bf11502dab2a	Test Org	\N	MEDIUM	2025-10-08 00:59:11.756355	2025-10-08 00:59:11.756359
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: devops
--

COPY public.users (id, email, hashed_password, full_name, role, is_active, organization_id, created_at, updated_at, last_login) FROM stdin;
6f411232-19f8-41b1-b8cc-f63a85a88111	admin@example.com	$2b$12$nZeovRuP8Ku37ed2wPrrfOwkpYt8u/RXK3xTPWhShb4QvshPsIjuC	Admin User	ADMIN	t	156b3892-3c64-444f-834f-bf11502dab2a	2025-10-08 00:59:11.933146	2025-10-08 00:59:11.933151	\N
\.


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: domain_scores domain_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.domain_scores
    ADD CONSTRAINT domain_scores_pkey PRIMARY KEY (id);


--
-- Name: gate_responses gate_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.gate_responses
    ADD CONSTRAINT gate_responses_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: gate_responses uq_assessment_gate_question; Type: CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.gate_responses
    ADD CONSTRAINT uq_assessment_gate_question UNIQUE (assessment_id, gate_id, question_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_assessments_assessor_id; Type: INDEX; Schema: public; Owner: devops
--

CREATE INDEX ix_assessments_assessor_id ON public.assessments USING btree (assessor_id);


--
-- Name: ix_assessments_organization_id; Type: INDEX; Schema: public; Owner: devops
--

CREATE INDEX ix_assessments_organization_id ON public.assessments USING btree (organization_id);


--
-- Name: ix_assessments_status; Type: INDEX; Schema: public; Owner: devops
--

CREATE INDEX ix_assessments_status ON public.assessments USING btree (status);


--
-- Name: ix_domain_scores_assessment_id; Type: INDEX; Schema: public; Owner: devops
--

CREATE INDEX ix_domain_scores_assessment_id ON public.domain_scores USING btree (assessment_id);


--
-- Name: ix_gate_responses_assessment_id; Type: INDEX; Schema: public; Owner: devops
--

CREATE INDEX ix_gate_responses_assessment_id ON public.gate_responses USING btree (assessment_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: devops
--

CREATE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_organization_id; Type: INDEX; Schema: public; Owner: devops
--

CREATE INDEX ix_users_organization_id ON public.users USING btree (organization_id);


--
-- Name: assessments assessments_assessor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_assessor_id_fkey FOREIGN KEY (assessor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: assessments assessments_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: domain_scores domain_scores_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.domain_scores
    ADD CONSTRAINT domain_scores_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: gate_responses gate_responses_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.gate_responses
    ADD CONSTRAINT gate_responses_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: users users_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devops
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict BAJQFEoDtAA8KCDGTHqnSmNpFrfZD0mYAScaNWYktdkIL7t85hJHOOEwUHiZxl4

