import {
    type AuthStatus,
    CURRENT_REPOSITORY_DIRECTORY_PROVIDER_URI,
    type ClientConfiguration,
    DOTCOM_URL,
    GIT_OPENCTX_PROVIDER_URI,
    WEB_PROVIDER_URI,
    featureFlagProvider,
    firstValueFrom,
} from '@sourcegraph/cody-shared'
import { Observable } from 'observable-fns'
import { describe, expect, test, vi } from 'vitest'
import { getOpenCtxProviders } from './openctx'
import RemoteDirectoryProvider from './openctx/remoteDirectorySearch'
import RemoteFileProvider from './openctx/remoteFileSearch'
import RemoteRepositorySearch from './openctx/remoteRepositorySearch'

vi.mock('../../../lib/shared/src/experimentation')

describe('getOpenCtxProviders', () => {
    const mockConfig = (experimentalNoodle: boolean): Observable<ClientConfiguration> => {
        return Observable.of({ experimentalNoodle } as ClientConfiguration)
    }

    const mockAuthStatus = (isDotCom: boolean): Observable<Pick<AuthStatus, 'endpoint'>> => {
        return Observable.of({ endpoint: isDotCom ? DOTCOM_URL.toString() : 'https://example.com' })
    }

    test('dotcom user', async () => {
        vi.spyOn(featureFlagProvider.instance!, 'evaluatedFeatureFlag').mockReturnValue(
            Observable.of(false)
        )

        const providers = await firstValueFrom(
            getOpenCtxProviders(mockConfig(false), mockAuthStatus(true), true)
        )

        expect(providers.map(p => p.providerUri)).toEqual([WEB_PROVIDER_URI])
    })

    test('enterprise user', async () => {
        vi.spyOn(featureFlagProvider.instance!, 'evaluatedFeatureFlag').mockReturnValue(
            Observable.of(false)
        )

        const providers = await firstValueFrom(
            getOpenCtxProviders(mockConfig(false), mockAuthStatus(false), true)
        )

        expect(providers.map(p => p.providerUri)).toEqual([
            WEB_PROVIDER_URI,
            RemoteRepositorySearch.providerUri,
            RemoteDirectoryProvider.providerUri,
            CURRENT_REPOSITORY_DIRECTORY_PROVIDER_URI,
            RemoteFileProvider.providerUri,
        ])
    })

    test('should include gitMentionsProvider when feature flag is true', async () => {
        vi.spyOn(featureFlagProvider.instance!, 'evaluatedFeatureFlag').mockReturnValue(
            Observable.of(true)
        )

        const providers = await firstValueFrom(
            getOpenCtxProviders(mockConfig(false), mockAuthStatus(false), true)
        )

        expect(providers.map(p => p.providerUri)).toContain(GIT_OPENCTX_PROVIDER_URI)
    })
})
