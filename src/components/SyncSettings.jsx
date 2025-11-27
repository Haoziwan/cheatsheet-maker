
import { useState, useEffect } from 'react';
import { Github, Save, RefreshCw, LogOut, ExternalLink, Check, AlertCircle } from 'lucide-react';
import githubSync from '../utils/githubSync';
import './SyncSettings.css';

function SyncSettings({ isOpen, onClose, onPush, onPull }) {
    const [token, setToken] = useState('');
    const [user, setUser] = useState(null);
    const [repoName, setRepoName] = useState('cheatsheet-data');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const savedToken = localStorage.getItem('github_token');
        const savedRepo = localStorage.getItem('github_repo');
        if (savedToken) {
            setToken(savedToken);
            validateAndLoadUser(savedToken);
        }
        if (savedRepo) {
            setRepoName(savedRepo);
        }
    }, []);

    const validateAndLoadUser = async (authToken) => {
        setStatus('loading');
        try {
            const userData = await githubSync.validateToken(authToken);
            setUser(userData);
            setStatus('success');
            setMessage(`Connected as ${userData.login}`);
            localStorage.setItem('github_token', authToken);
            localStorage.setItem('github_user', userData.login);
        } catch (error) {
            setStatus('error');
            setMessage('Invalid token');
            setUser(null);
        }
    };

    const handleConnect = () => {
        if (!token) {
            setStatus('error');
            setMessage('Please enter a token');
            return;
        }
        validateAndLoadUser(token);
    };

    const handleDisconnect = () => {
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_user');
        setToken('');
        setUser(null);
        setStatus('idle');
        setMessage('');
    };

    const performSyncAction = async (actionName, actionFn) => {
        if (!user || !token) return;

        setStatus('loading');
        setMessage(`${actionName}...`);

        try {
            // Check if repo exists, if not create it (only for push, but good to check for pull too)
            let repo = await githubSync.getRepo(token, user.login, repoName);
            if (!repo) {
                if (actionName === 'Pushing') {
                    setMessage('Creating repository...');
                    repo = await githubSync.createRepo(token, repoName);
                } else {
                    throw new Error('Repository not found');
                }
            }

            localStorage.setItem('github_repo', repoName);

            // Call parent handler
            await actionFn(token, user.login, repoName);

            setStatus('success');
            setMessage(`${actionName} completed successfully!`);
            setTimeout(() => setMessage(`Connected as ${user.login}`), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(`${actionName} failed: ` + error.message);
        }
    };

    const handlePush = () => performSyncAction('Pushing', onPush);
    const handlePull = () => performSyncAction('Pulling', onPull);

    const openTokenPage = () => {
        window.open('https://github.com/settings/tokens/new?scopes=repo&description=CheatsheetMaker', '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="sync-settings-overlay" onClick={onClose}>
            <div className="sync-settings-modal" onClick={e => e.stopPropagation()}>
                <div className="sync-header">
                    <div className="sync-title">
                        <Github size={20} />
                        <span>GitHub Sync</span>
                    </div>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>

                <div className="sync-content">
                    {!user ? (
                        <div className="auth-section">
                            <p className="sync-desc">
                                Connect your GitHub account to sync your cheatsheets to the cloud.
                            </p>

                            <div className="token-input-group">
                                <input
                                    type="password"
                                    placeholder="Paste your Personal Access Token"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="token-input"
                                />
                                <button className="btn btn-primary" onClick={handleConnect}>
                                    Connect
                                </button>
                            </div>

                            <div className="help-text">
                                <button className="btn-link" onClick={openTokenPage}>
                                    <ExternalLink size={14} />
                                    Generate new token (Select 'repo' scope)
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="connected-section">
                            <div className="user-info">
                                <img src={user.avatar_url} alt={user.login} className="user-avatar" />
                                <div className="user-details">
                                    <span className="user-name">{user.name || user.login}</span>
                                    <span className="user-login">@{user.login}</span>
                                </div>
                                <button className="btn-icon btn-danger" onClick={handleDisconnect} title="Disconnect">
                                    <LogOut size={16} />
                                </button>
                            </div>

                            <div className="repo-section">
                                <label>Repository Name</label>
                                <input
                                    type="text"
                                    value={repoName}
                                    onChange={(e) => setRepoName(e.target.value)}
                                    className="repo-input"
                                />
                            </div>

                            <div className="sync-actions-grid">
                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={handlePush}
                                    disabled={status === 'loading'}
                                    title="Upload local files to GitHub"
                                >
                                    {status === 'loading' && message.startsWith('Pushing') ? (
                                        <RefreshCw size={16} className="spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    Push to Cloud
                                </button>
                                <button
                                    className="btn btn-secondary btn-block"
                                    onClick={handlePull}
                                    disabled={status === 'loading'}
                                    title="Download files from GitHub"
                                >
                                    {status === 'loading' && message.startsWith('Pulling') ? (
                                        <RefreshCw size={16} className="spin" />
                                    ) : (
                                        <RefreshCw size={16} />
                                    )}
                                    Pull from Cloud
                                </button>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`status-message ${status}`}>
                            {status === 'success' && <Check size={16} />}
                            {status === 'error' && <AlertCircle size={16} />}
                            <span>{message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SyncSettings;
