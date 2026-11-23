import type {
  CommitDataInputRequest,
  DataInputCommitResponse,
  DataInputPreviewResponse,
  PreviewDataInputRequest,
} from "@color-bank-hub/contracts/data-input";
import { post } from "@/lib/http";

export function previewDataInput(request: PreviewDataInputRequest) {
  return post<DataInputPreviewResponse>("/data-input/preview", request);
}

export function commitDataInput(request: CommitDataInputRequest) {
  return post<DataInputCommitResponse>("/data-input/commit", request);
}
