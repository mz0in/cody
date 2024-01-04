import * as vscode from 'vscode'

import { ChatEventSource } from '@sourcegraph/cody-shared/src/chat/transcript/messages'
import { FixupIntent } from '@sourcegraph/cody-shared/src/editor'

import { FixupFile } from './FixupFile'
import { FixupTask } from './FixupTask'

// Role interfaces so that sub-objects of the FixupController can consume a
// narrow part of the controller.

/**
 * Provides access to a list of fixup tasks.
 */
export interface FixupFileCollection {
    tasksForFile(file: FixupFile): FixupTask[]

    /**
     * If there is a FixupFile for the specified URI, return it, otherwise
     * undefined. VScode callbacks which have a document or URI can use this
     * to determine if there may be interest in the URI.
     * @param uri the URI of the document of interest.
     */
    maybeFileForUri(uri: vscode.Uri): FixupFile | undefined
}

/**
 * Schedules a task for when the event loop is idle.
 */
export interface FixupIdleTaskRunner {
    scheduleIdle<T>(callback: () => T): Promise<T>
}

/**
 * Creates and starts processing a task.
 */
export interface FixupTaskFactory {
    createTask(
        documentUri: vscode.Uri,
        instruction: string,
        selectionRange: vscode.Range,
        intent?: FixupIntent,
        insertMode?: boolean,
        source?: ChatEventSource
    ): Promise<FixupTask>
}

/**
 * Sink for notifications that text related to the fixup task--either the text
 * in the file, or the text provided by Cody--has changed.
 */
export interface FixupTextChanged {
    textDidChange(task: FixupTask): void
    rangeDidChange(task: FixupTask): void
    cancelTask(task: FixupTask): void
}
