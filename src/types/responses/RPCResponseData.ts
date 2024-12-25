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

    // ADD/REMOVE FRIEND RPC FUNCTIONS
    FRIEND_ADDED_SUCCESSFULLY = 'FRIEND_ADDED_SUCCESSFULLY',
    FRIEND_REMOVED_SUCCESSFULLY = 'FRIEND_REMOVED_SUCCESSFULLY',
    TEMPORARY_PLAYER_NOT_FOUND = 'TEMPORARY_PLAYER_NOT_FOUND',

    // JOIN MATCH RPC FUNCTION
    INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
    MATCH_FULL = 'MATCH_FULL',

    // GENERAL MESSAGES
    UNEXPECTED_ERROR = 'UNEXPECTED_ERROR'
}

export type RPCResponseData = {
    success: boolean;
    code: TranslationMessageCode;
    metadata?: TranslationValues;
}