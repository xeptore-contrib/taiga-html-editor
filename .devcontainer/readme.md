# Dev Container for this repository

This Dev Container provides a fast, reproducible environment with all required tools preinstalled for working on this repository (Node, buf, shell tooling, and quality-of-life improvements like zsh + autosuggestions + completions).

## Benefits

- Consistent toolchain: Same versions of Node, buf, git, and CLI tools across all contributors.
- Zero host setup: No need to install or manage tools on your machine beyond Docker + VS Code.
- Reproducible builds: Rebuild the container to return to a known-good state at any time.
- Better ergonomics: zsh with Oh My Zsh, autosuggestions, and wide command completions preconfigured.
- Isolation and safety: Work is contained; your host stays clean and stable.

## How to Use

1. Install prerequisites:
    - Docker Desktop or Docker Engine
    - Visual Studio Code
    - VS Code "Dev Containers" extension (`ms-vscode-remote.remote-containers`)
2. Open the repository in VS Code.
3. Command Palette → "Dev Containers: Reopen in Container".
4. Wait for the image build and container start.

Notes:

- Linux users should set `UID`/`GID` build arguments to match their host user (details below).
- On WSL and macOS, prefer using "Clone repository in Named Container Volume…" (details below) for best disk I/O performance.

## Linux: UID/GID Build Args (Required)

To avoid file permission mismatches on bind-mounted workspaces, set your host user and group IDs as build args before building the container.

1. On the host, get your IDs:

    ```bash
    id -u
    id -g
    ```

2. Update the `.devcontainer/devcontainer.json` build args to match your IDs:

    ```json
    {
      "build": {
        "args": {
          "USER_UID": "<your-uid>",
          "USER_GID": "<your-gid>"
        }
      }
    }
    ```

3. Rebuild the container: Command Palette → "Dev Containers: Rebuild and Reopen in Container".

This project already sets defaults (`USER_UID`/`USER_GID` → 1000). On many Linux systems this is correct; if your IDs differ, update them. The container is configured with `updateRemoteUserUID: true` to align filesystem ownership with your host.

## WSL and macOS: Use a Named Container Volume (Recommended)

On WSL and macOS, performance over bind mounts can be slower due to filesystem translation. For best performance, use a named Docker volume managed by Dev Containers:

1. Command Palette → "Dev Containers: Clone Repository in Named Container Volume…".
2. Enter the repository URL and choose a volume name.
3. VS Code will clone into the volume and open it in a Dev Container automatically.

This approach significantly improves disk I/O vs. opening the repo from a host folder.

## Troubleshooting

- GPG commit signing error: "S.keyboxd not being available" when committing
  - Cause: The GPG agent/keys aren’t initialized on the host, so the container can’t access them via shared sockets.
  - To fix it:
      1. Run on the host, not inside the container:

          ```bash
          gpg --list-secret-keys
          gpgconf --launch gpg-agent
          ```

      2. Then rebuild the container so changes take effect:
          - Command Palette → "Dev Containers: Rebuild and Reopen in Container"

- Permission issues on created files
  - Ensure `USER_UID`/`USER_GID` in `.devcontainer/devcontainer.json` match your host IDs and rebuild.

- Slow filesystem I/O on WSL/macOS
  - Use "Clone Repository in Named Container Volume…" instead of opening a host bind mount.

## Shell, Prompt, and Tab Completions

This environment aims to provide completions "as much as possible" out of the box.

- Shell: zsh + Oh My Zsh + zsh-autosuggestions
- Preloaded completions:
  - buf (`buf completion`) → zsh completion installed
  - task (`task --completion`) → zsh completion installed
  - eza and bat → zsh completions installed
- Common plugins enabled in `.devcontainer/.zshrc`:
  - `git`, `eza`, `zsh-autosuggestions`, `npm`, `node`

Completions are placed under `~/.oh-my-zsh/completions` and loaded automatically by zsh on startup.

## Useful Dev Containers Commands

- Reopen: "Dev Containers: Reopen in Container"
- Rebuild: "Dev Containers: Rebuild and Reopen in Container"
- Rebuild (no cache): "Dev Containers: Rebuild Without Cache and Reopen in Container"
- Clone into named volume: "Dev Containers: Clone Repository in Named Container Volume…"

## Updating pinned tool versions

Most tool versions are pinned in `.devcontainer/devcontainer.json` under `build.args` (for example: `NODE_VERSION`, `BUF_VERSION`, `TASK_VERSION`, `GIT_VERSION`, and related checksums). To update:

1. Pick the new version and find its official checksums.
2. Edit the matching `*_VERSION` and checksum args in `.devcontainer/devcontainer.json`.
3. If the Dockerfile downloads a new archive name/URL, align it in `.devcontainer/Dockerfile` (rare; URLs are already templated on version + arch).
4. Rebuild the container to validate the bump: Command Palette → "Dev Containers: Rebuild and Reopen in Container".

If a version bump adds new completions, ensure they are installed similarly to the existing ones (`buf`, `task`, `eza`, `bat`).

## Verify the image builds cleanly

From VS Code: Command Palette → "Dev Containers: Rebuild and Reopen in Container".

## What’s Included (high level)

- Ubuntu 24.04 base with curated CLI tools (`jq`, `yq`, `ripgrep`, `fd`, `fzf`, `eza`, `bat`, `btop`, etc.)
- Custom-built git matching the pinned version
- .NET SDK (version pinned via `devcontainer.json`)
- buf (version pinned via `devcontainer.json`)
- zsh, Oh My Zsh, autosuggestions, and completions

If you need to refresh the environment, simply rebuild the container. All tooling is pinned in `.devcontainer/devcontainer.json` and installed by `.devcontainer/Dockerfile`.
