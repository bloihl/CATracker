import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { DEFAULT_FEEDS } from '@/gtfs/feeds';
import { hasAnyData, refreshFeed } from '@/gtfs/service';

interface BootstrapProps {
    children: React.ReactNode;
}

type Status = {
    phase?: string;
    message?: string;
    error?: string | null;
};

export default function Bootstrap({ children }: BootstrapProps): React.JSX.Element {
    const feed = useMemo(() => DEFAULT_FEEDS[0], []); // for now single default feed
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<Status>({ message: 'Checking data…' });
    const runningRef = useRef(false);

    const runBootstrap = async () => {
        if (runningRef.current) return;
        runningRef.current = true;
        setLoading(true);
        setStatus({ message: 'Checking data…', error: null });
        try {
            const exists = await hasAnyData(feed.key);
            if (exists) {
                setReady(true);
                setLoading(false);
                return;
            }
            // No data — perform a blocking refresh with progress
            await refreshFeed({
                feed,
                onProgress: (p) => setStatus({ phase: p.phase, message: p.message || p.phase }),
            });
            setReady(true);
            setLoading(false);
        } catch (e: any) {
            setStatus({ error: e?.message || String(e), message: 'Refresh failed' });
            setLoading(false);
        } finally {
            runningRef.current = false;
        }
    };

    useEffect(() => {
        runBootstrap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (ready) {
        return <>{children}</>;
    }

    // Blocking overlay while loading or if error shown (until user retries)
    return (
        <View style={styles.blocker}>
            <View style={styles.card}>
                {loading ? (
                    <>
                        <ActivityIndicator size="large" />
                        {!!status?.message && <Text style={styles.msg}>{status.message}</Text>}
                        {!!status?.phase && <Text style={styles.sub}>{status.phase}</Text>}
                    </>
                ) : (
                    <>
                        <Text style={styles.msg}>{status?.message || 'Unable to load data'}</Text>
                        {!!status?.error && <Text style={styles.err} numberOfLines={4}>{status.error}</Text>}
                        <Pressable style={styles.btn} onPress={runBootstrap}>
                            <Text style={styles.btnText}>Retry</Text>
                        </Pressable>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    blocker: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    card: {
        minWidth: 260,
        maxWidth: 320,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 2,
    },
    msg: { marginTop: 12, fontSize: 16, textAlign: 'center' },
    sub: { marginTop: 6, fontSize: 13, opacity: 0.7, textAlign: 'center' },
    err: { marginTop: 8, fontSize: 12, color: '#b00020', textAlign: 'center' },
    btn: {
        marginTop: 16,
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        backgroundColor: '#246bfd',
    },
    btnText: { color: '#fff', fontWeight: '600' },
});