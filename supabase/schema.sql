-- Schema for Weighment System (Multi-tenant)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    api_key TEXT UNIQUE,
    join_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.weighment_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id),
    file_name TEXT NOT NULL,
    file_hash TEXT UNIQUE NOT NULL,
    raw_text TEXT,
    parsed_json JSONB,
    status TEXT DEFAULT 'processed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.weighment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id),
    vehicle_number TEXT NOT NULL,
    gross_weight INTEGER,
    tare_weight INTEGER,
    net_weight INTEGER,
    material TEXT,
    party_name TEXT,
    slip_number TEXT,
    gross_time TIMESTAMP WITH TIME ZONE,
    tare_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'open', -- open, closed, review, error
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active transactions are per company
CREATE UNIQUE INDEX active_transaction_idx ON public.weighment_transactions (company_id, vehicle_number) WHERE status = 'open';

CREATE TABLE public.corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id),
    weighment_file_id UUID REFERENCES public.weighment_files(id),
    original_data JSONB,
    corrected_data JSONB,
    pattern_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.duplicate_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id),
    file_name TEXT,
    hash TEXT,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id),
    file_name TEXT,
    raw_text TEXT,
    error_message TEXT,
    ai_output JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id),
    type TEXT,       -- e.g., 'anomaly', 'fraud'
    message TEXT,
    severity TEXT,   -- 'low', 'medium', 'high'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE
);
