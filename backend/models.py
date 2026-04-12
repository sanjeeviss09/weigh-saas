from pydantic import BaseModel, model_validator
from typing import Optional

class WeighmentData(BaseModel):
    vehicle_number: str
    gross_weight: Optional[int] = None
    tare_weight: Optional[int] = None
    net_weight: Optional[int] = None
    material: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    party_name: Optional[str] = None
    slip_number: Optional[str] = None
    rate_per_ton: Optional[float] = None
    amount: Optional[float] = None

    @model_validator(mode='before')
    @classmethod
    def normalize_and_validate(cls, values):
        if not isinstance(values, dict):
            return values
        if values.get('vehicle_number'):
            values['vehicle_number'] = str(values['vehicle_number']).replace(" ", "").upper()
            
        for w in ['gross_weight', 'tare_weight', 'net_weight']:
            if values.get(w) is not None:
                try:
                    if int(values[w]) < 0:
                        raise ValueError(f"{w} cannot be negative.")
                except (ValueError, TypeError):
                    pass
        return values

class CorrectionRequest(BaseModel):
    file_id: str
    company_id: str
    corrected_data: WeighmentData
    pattern_notes: Optional[str] = None

class OperatorCodeRequest(BaseModel):
    name: str
    contact: str
    message: Optional[str] = None

class CompanyProfileUpdate(BaseModel):
    name: str
    plan: str
    full_name: Optional[str] = None
    phone: Optional[str] = None

class CompanyRegistration(BaseModel):
    name: str
    plan: str
