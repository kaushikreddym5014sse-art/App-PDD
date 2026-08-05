export interface Certificate {
  id: string;
  holder_name: string;
  degree: string;
  institution: string;
  issue_date: string;
  grade?: string;
  reg_number?: string;
  blockchain_hash?: string;
  status: 'verified' | 'pending' | 'suspicious' | 'fraud';
  fraud_score?: number;
  created_at?: string;
  // Mapped for Web3 proof display
  txHash?: string;
}

export interface VerificationResult {
  found: boolean;
  certificate: Certificate | null;
  message?: string;
  fraudDetails?: {
    fraud_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    status: string;
    verdict: string;
  };
}

export interface IssueCertificatePayload {
  holder_name: string;
  degree: string;
  institution: string;
  issue_date: string;
  grade?: string;
  reg_number?: string;
}
