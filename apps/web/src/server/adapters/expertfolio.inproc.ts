type AssessmentResp = {
  id: string;
  programId: string;
  epaId: string;
  status: 'submitted';
  submittedAt: string;
};

type EvaluationResp = {
  id: string;
  assessmentId: string;
  outcome: 'approved' | 'rejected' | 'needs_changes';
  comments?: string;
  createdAt: string;
};

const assessments = new Map<string, AssessmentResp>();
const evaluations = new Map<string, EvaluationResp>();

export async function createAssessment(input: { programId: string; epaId: string; userId: string }): Promise<AssessmentResp> {
  const id = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  const resp: AssessmentResp = { id, programId: input.programId, epaId: input.epaId, status: 'submitted', submittedAt };
  assessments.set(id, resp);
  return resp;
}

export async function createEvaluation(input: { assessmentId: string; outcome: 'approved'|'rejected'|'needs_changes'; comments?: string; userId: string }): Promise<EvaluationResp> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const resp: EvaluationResp = { id, assessmentId: input.assessmentId, outcome: input.outcome, createdAt };
  if (input.comments) resp.comments = input.comments;
  evaluations.set(id, resp);
  return resp;
}


