// TYPES
import type { TranslationValues } from "next-intl";

export enum TranslationMessageCode {
    // FINISH MATCH RPC FUNCTION
    MATCH_FINISHED_SUCCESSFULLY = 'MATCH_FINISHED_SUCCESSFULLY',
    MATCH_NOT_FOUND = 'MATCH_NOT_FOUND',
    FAILED_TO_INSERT_MATCH_HISTORY = 'FAILED_TO_INSERT_MATCH_HISTORY',
    FAILED_TO_UPDATE_USER_DEBT = 'FAILED_TO_UPDATE_USER_DEBT',
    FAILED_TO_INSERT_DEBT = 'FAILED_TO_INSERT_DEBT',
    FAILED_TO_DELETE_MATCH = 'FAILED_TO_DELETE_MATCH',

    // SORT TEAMS RPC FUNCTION
    TEAMS_SORT_FAILED = 'TEAMS_SORT_FAILED',
    TEAMS_SORTED_SUCCESSFULLY = 'TEAMS_SORTED_SUCCESSFULLY',

    // GENERAL MESSAGES
    UNEXPECTED_ERROR = 'UNEXPECTED_ERROR'
}

export type RPCResponseData = {
    success: boolean;
    code: TranslationMessageCode;
    metadata?: TranslationValues; 
}