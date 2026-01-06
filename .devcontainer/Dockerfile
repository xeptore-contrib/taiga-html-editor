# syntax=docker/dockerfile:1
FROM --platform=$BUILDPLATFORM docker.io/library/ubuntu:24.04 AS git-build

ARG TARGETARCH
ARG BUILDARCH

RUN <<EOT bash
  set -Eexuo pipefail

  case "${BUILDARCH}" in
    amd64|arm64) ;;
    *) echo "Only amd64 or arm64 build architecture is supported" >&2; exit 16 ;;
  esac;

  case "${TARGETARCH}" in
    arm64|amd64) ;;
    *) echo "Only arm64 or amd64 target architecture is supported" >&2; exit 16 ;;
  esac;
EOT

ENV DEBIAN_FRONTEND=noninteractive

COPY ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources

RUN <<EOT bash
  set -Eexuo pipefail

  if [ "$BUILDARCH" = "amd64" ] && [ "$TARGETARCH" = "arm64" ]; then
    dpkg --add-architecture arm64
  elif [ "$BUILDARCH" = "arm64" ] && [ "$TARGETARCH" = "amd64" ]; then
    dpkg --add-architecture amd64
  fi

  # --- System cleanup & base deps ---
  apt-get update
  apt-get upgrade -y --no-install-recommends

  pkgs=("build-essential")
  pkgs+=("pkg-config")
  pkgs+=("gettext")
  pkgs+=("curl")
  pkgs+=("file")
  pkgs+=("ca-certificates")
  pkgs+=("tar")
  pkgs+=("clang")
  pkgs+=("llvm")
  pkgs+=("lld")

  # Install packages in multiple steps to avoid OOM while dpkg configures packages
  apt-get install -y --no-install-recommends "\${pkgs[@]}"

  pkgs=()
  if [ "$BUILDARCH" = "amd64" ] && [ "$TARGETARCH" = "arm64" ]; then
    pkgs+=("gcc-aarch64-linux-gnu")
    pkgs+=("binutils-aarch64-linux-gnu")
    pkgs+=("libc6-dev-arm64-cross")
    pkgs+=("linux-libc-dev-arm64-cross")
    pkgs+=("libssl-dev:arm64")
    pkgs+=("zlib1g-dev:arm64")
    pkgs+=("libcurl4-openssl-dev:arm64")
    pkgs+=("libexpat1-dev:arm64")
    pkgs+=("libpcre2-dev:arm64")
    pkgs+=("libpcre2-posix3:arm64")
  elif [ "$BUILDARCH" = "arm64" ] && [ "$TARGETARCH" = "amd64" ]; then
    pkgs+=("gcc-x86-64-linux-gnu")
    pkgs+=("binutils-x86-64-linux-gnu")
    pkgs+=("libc6-dev-amd64-cross")
    pkgs+=("linux-libc-dev-amd64-cross")
    pkgs+=("libssl-dev:amd64")
    pkgs+=("zlib1g-dev:amd64")
    pkgs+=("libcurl4-openssl-dev:amd64")
    pkgs+=("libexpat1-dev:amd64")
    pkgs+=("libpcre2-dev:amd64")
    pkgs+=("libpcre2-posix3:amd64")
  else
    pkgs+=("libssl-dev")
    pkgs+=("zlib1g-dev")
    pkgs+=("libcurl4-openssl-dev")
    pkgs+=("libexpat1-dev")
    pkgs+=("libpcre2-dev")
    pkgs+=("libpcre2-posix3")
  fi

  apt-get install -y --no-install-recommends "\${pkgs[@]}"
EOT

WORKDIR /opt/git

ARG GIT_VERSION=2.52.0

RUN <<EOT bash
  set -Eexuo pipefail

  curl -sSfL --tlsv1.3 "https://github.com/git/git/archive/v${GIT_VERSION}.tar.gz" | tar -xzf -

  cd git-${GIT_VERSION}

  make_opts=("prefix=/opt/git")
  make_opts+=("sysconfdir=/etc")
  if [ "$BUILDARCH" = "amd64" ] && [ "$TARGETARCH" = "arm64" ]; then
    make_opts+=("HOST_CPU=x86_64")
    make_opts+=("AR=llvm-ar")
    make_opts+=("RANLIB=llvm-ranlib")
    make_opts+=("STRIP=llvm-strip")
    make_opts+=("CC=clang --target=aarch64-linux-gnu -I/usr/include/aarch64-linux-gnu")
    make_opts+=("CXX=clang++ --target=aarch64-linux-gnu -I/usr/include/aarch64-linux-gnu")
    make_opts+=("CFLAGS=-Os -flto -ffunction-sections -fdata-sections -I/usr/include/aarch64-linux-gnu")
    make_opts+=("CPPFLAGS=-Os -flto -ffunction-sections -fdata-sections -I/usr/include/aarch64-linux-gnu")
    make_opts+=("LDFLAGS=-flto -fuse-ld=lld -Wl,--gc-sections -L/usr/aarch64-linux-gnu")
  elif [ "$BUILDARCH" = "arm64" ] && [ "$TARGETARCH" = "amd64" ]; then
    make_opts+=("HOST_CPU=aarch64")
    make_opts+=("AR=llvm-ar")
    make_opts+=("RANLIB=llvm-ranlib")
    make_opts+=("STRIP=llvm-strip")
    make_opts+=("CC=clang --target=x86_64-linux-gnu -I/usr/include/x86_64-linux-gnu")
    make_opts+=("CXX=clang++ --target=x86_64-linux-gnu -I/usr/include/x86_64-linux-gnu")
    make_opts+=("CFLAGS=-Os -flto -ffunction-sections -fdata-sections -I/usr/include/x86_64-linux-gnu")
    make_opts+=("CPPFLAGS=-Os -flto -ffunction-sections -fdata-sections -I/usr/include/x86_64-linux-gnu")
    make_opts+=("LDFLAGS=-flto -fuse-ld=lld -Wl,--gc-sections -L/usr/x86_64-linux-gnu")
  else
    make_opts+=("AR=llvm-ar")
    make_opts+=("RANLIB=llvm-ranlib")
    make_opts+=("STRIP=llvm-strip")
    make_opts+=("CC=clang")
    make_opts+=("CXX=clang++")
    make_opts+=("CFLAGS=-Os -flto -ffunction-sections -fdata-sections")
    make_opts+=("CPPFLAGS=-Os -flto -ffunction-sections -fdata-sections")
    make_opts+=("LDFLAGS=-flto -fuse-ld=lld -Wl,--gc-sections")
  fi
  make_opts+=("USE_OPENSSL=YesPlease")
  make_opts+=("USE_LIBPCRE=YesPlease")
  make_opts+=("NO_SVN_TESTS=YesPlease")
  make_opts+=("NO_TCLTK=YesPlease")
  make_opts+=("NO_GETTEXT=YesPlease")
  make_opts+=("NO_PERL=YesPlease")
  make_opts+=("NO_PYTHON=YesPlease")
  make_opts+=("NO_GITWEB=YesPlease")

  make -s "\${make_opts[@]}" -j\$(nproc) all
  make -s "\${make_opts[@]}" -j\$(nproc) install

  llvm-strip /opt/git/bin/git
  file /opt/git/bin/git
EOT

FROM docker.io/library/ubuntu:24.04 AS devcontainer

ENV DEBIAN_FRONTEND=noninteractive
ARG USER_UID
ARG USER_GID
ARG TARGETARCH
# https://github.com/bootandy/dust/releases
ARG DUST_VERSION
# dust-${DUST_VERSION}-aarch64-unknown-linux-gnu.tar.gz
ARG DUST_SHA256_AMD64
# dust-${DUST_VERSION}-x86_64-unknown-linux-gnu.tar.gz
ARG DUST_SHA256_ARM64
# https://github.com/sharkdp/bat/releases
ARG BAT_VERSION
# bat-${BAT_VERSION}-x86_64-unknown-linux-gnu.tar.gz
ARG BAT_SHA256_AMD64
# bat-${BAT_VERSION}-aarch64-unknown-linux-gnu.tar.gz
ARG BAT_SHA256_ARM64
# https://github.com/mikefarah/yq/releases
ARG YQ_VERSION
# yq_linux_amd64
ARG YQ_SHA_AMD64
# yq_linux_arm64
ARG YQ_SHA_ARM64
# https://github.com/jqlang/jq/releases
ARG JQ_VERSION
# jq-linux-amd64
ARG JQ_SHA256_AMD64
# jq-linux-arm64
ARG JQ_SHA256_ARM64
# https://github.com/eza-community/eza/releases
ARG EZA_VERSION
# eza_x86_64-unknown-linux-gnu.tar.gz
ARG EZA_SHA256_AMD64
# eza_aarch64-unknown-linux-gnu.tar.gz
ARG EZA_SHA256_ARM64
# https://nodejs.org/en/download/archive/v12
ARG NODE_VERSION
# https://github.com/ohmyzsh/ohmyzsh/commits
ARG OMZ_COMMIT
# https://github.com/zsh-users/zsh-autosuggestions/commits
ARG ZSH_AUTOSUGGESTIONS_COMMIT

WORKDIR /root

RUN <<EOT bash
  set -Eexuo pipefail

  # --- System cleanup & base deps ---
  apt-get update
  apt-get upgrade -y --no-install-recommends
  apt-get install -y --no-install-recommends \
    apt-transport-https \
    apt-utils \
    btop \
    ca-certificates \
    coreutils \
    curl \
    direnv \
    dnsutils \
    fd-find \
    file \
    fzf \
    gnupg2 \
    gosu \
    iputils-ping \
    less \
    libicu74 \
    locales \
    nano \
    net-tools \
    netcat-openbsd \
    nload \
    openssh-client \
    procps \
    ripgrep \
    sed \
    tree \
    unzip \
    util-linux \
    vim \
    wget \
    xz-utils \
    zip \
    zsh

  # --- Locale ---
  localedef -i en_US -c -f UTF-8 en_US.UTF-8

  update-ca-certificates

  # --- User ---
  if [ '1000' = "${USER_UID}" ]; then
    usermod -l vscode ubuntu
    groupmod -n vscode ubuntu
    usermod -d /home/vscode -m vscode
    usermod -G vscode vscode
    usermod -s /usr/bin/zsh vscode
  else
    groupadd --gid "${USER_GID}" vscode
    useradd -m -u "${USER_UID}" -g "${USER_GID}" -s /usr/bin/zsh vscode
  fi

  # --- zsh ---
  gosu vscode mkdir -p /home/vscode/.oh-my-zsh
  gosu vscode bash -c "curl -sSfL https://github.com/ohmyzsh/ohmyzsh/archive/${OMZ_COMMIT}.tar.gz | tar -xzf - --strip-components=1 -C /home/vscode/.oh-my-zsh"
  gosu vscode mkdir -p /home/vscode/.oh-my-zsh/custom/plugins/zsh-autosuggestions
  gosu vscode bash -c "curl -sSfL https://github.com/zsh-users/zsh-autosuggestions/archive/${ZSH_AUTOSUGGESTIONS_COMMIT}.tar.gz | tar -xzf - --strip-components=1 -C /home/vscode/.oh-my-zsh/custom/plugins/zsh-autosuggestions"
  gosu vscode mkdir -p /home/vscode/.oh-my-zsh/completions

  # --- Install dust ---
  case "${TARGETARCH}" in
    amd64) DUST_ARCH=x86_64 ;;
    arm64) DUST_ARCH=aarch64 ;;
    *) echo "Unsupported target platform architecture: ${TARGETARCH}" >&2; exit 16 ;;
  esac;
  curl -fsSLO --tlsv1.3 "https://github.com/bootandy/dust/releases/download/${DUST_VERSION}/dust-${DUST_VERSION}-\${DUST_ARCH}-unknown-linux-gnu.tar.gz"
  case "${TARGETARCH}" in
    amd64) DUST_SHA256=${DUST_SHA256_AMD64} ;;
    arm64) DUST_SHA256=${DUST_SHA256_ARM64} ;;
    *) echo "Unsupported target platform architecture: ${TARGETARCH}" >&2; exit 16 ;;
  esac;
  echo "\${DUST_SHA256}  /root/dust-${DUST_VERSION}-\${DUST_ARCH}-unknown-linux-gnu.tar.gz" | sha256sum -c -
  tar -xzf "/root/dust-${DUST_VERSION}-\${DUST_ARCH}-unknown-linux-gnu.tar.gz" --strip-components=1 -C /usr/local/bin/ "dust-${DUST_VERSION}-\${DUST_ARCH}-unknown-linux-gnu/dust"
  gosu vscode dust --version
  rm "/root/dust-${DUST_VERSION}-\${DUST_ARCH}-unknown-linux-gnu.tar.gz"

  # --- Install bat ---
  case "${TARGETARCH}" in
    amd64) BAT_ARCH=x86_64 ;;
    arm64) BAT_ARCH=aarch64 ;;
    *) echo "Unsupported target platform architecture: ${TARGETARCH}" >&2; exit 16 ;;
  esac;
  mkdir /tmp/bat
  curl -fsSLO --tlsv1.3 "https://github.com/sharkdp/bat/releases/download/${BAT_VERSION}/bat-${BAT_VERSION}-\${BAT_ARCH}-unknown-linux-gnu.tar.gz"
  case "${TARGETARCH}" in
    amd64) BAT_SHA256=${BAT_SHA256_AMD64} ;;
    arm64) BAT_SHA256=${BAT_SHA256_ARM64} ;;
    *) echo "Unsupported target platform architecture: ${TARGETARCH}" >&2; exit 16 ;;
  esac;
  echo "\${BAT_SHA256}  /root/bat-${BAT_VERSION}-\${BAT_ARCH}-unknown-linux-gnu.tar.gz" | sha256sum
  tar -xzf "/root/bat-${BAT_VERSION}-\${BAT_ARCH}-unknown-linux-gnu.tar.gz" --strip-components=1 -C /tmp/bat "bat-${BAT_VERSION}-\${BAT_ARCH}-unknown-linux-gnu"
  mv /tmp/bat/bat /usr/local/bin/bat
  gosu vscode cp /tmp/bat/autocomplete/bat.zsh /home/vscode/.oh-my-zsh/completions/_bat
  rm -rf /tmp/bat
  gosu vscode bat --version
  rm "/root/bat-${BAT_VERSION}-\${BAT_ARCH}-unknown-linux-gnu.tar.gz"

  # --- Install jq ---
  curl -fsSL --tlsv1.3 "https://github.com/jqlang/jq/releases/download/jq-${JQ_VERSION}/jq-linux-${TARGETARCH}" -o /usr/local/bin/jq
  case "${TARGETARCH}" in
    amd64) JQ_SHA256=${JQ_SHA256_AMD64} ;;
    arm64) JQ_SHA256=${JQ_SHA256_ARM64} ;;
    *) echo "Unsupported target platform architecture: ${TARGETARCH}" >&2; exit 16 ;;
  esac;
  echo "\${JQ_SHA256}  /usr/local/bin/jq" | sha256sum
  chmod +x /usr/local/bin/jq
  gosu vscode jq --version

  # --- Install yq ---
  curl -fsSL --tlsv1.3 "https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_${TARGETARCH}" -o /usr/local/bin/yq
  case "${TARGETARCH}" in
    amd64) YQ_SHA256=${YQ_SHA_AMD64} ;;
    arm64) YQ_SHA256=${YQ_SHA_ARM64} ;;
    *) echo "Unsupported target platform architecture: ${TARGETARCH}" >&2; exit 16 ;;
  esac;
  echo "\${YQ_SHA256}  /usr/local/bin/yq" | sha256sum -c -
  chmod +x /usr/local/bin/yq
  gosu vscode yq --version

  # --- Install eza ---
  case "${TARGETARCH}" in
    amd64) EZA_ARCH=x86_64 ;;
    arm64) EZA_ARCH=aarch64 ;;
    *) echo "Unsupported target platform architecture: ${TARGETARCH}" >&2; exit 16 ;;
  esac;
  curl -fsSLO --tlsv1.3 "https://github.com/eza-community/eza/releases/download/${EZA_VERSION}/eza_\${EZA_ARCH}-unknown-linux-gnu.tar.gz"
  case "${TARGETARCH}" in
    amd64) EZA_SHA256=${EZA_SHA256_AMD64} ;;
    arm64) EZA_SHA256=${EZA_SHA256_ARM64} ;;
    *) echo "Unsupported target platform architecture: ${TARGETARCH}" >&2; exit 16 ;;
  esac;
  echo "\${EZA_SHA256}  /root/eza_\${EZA_ARCH}-unknown-linux-gnu.tar.gz" | sha256sum
  tar -xzf "/root/eza_\${EZA_ARCH}-unknown-linux-gnu.tar.gz" --strip-components=1 -C /usr/local/bin/ ./eza
  gosu vscode eza --version
  rm "/root/eza_\${EZA_ARCH}-unknown-linux-gnu.tar.gz"
  gosu vscode curl -fsSL --tlsv1.3 "https://raw.githubusercontent.com/eza-community/eza/refs/tags/${EZA_VERSION}/completions/zsh/_eza" -o /home/vscode/.oh-my-zsh/completions/_eza

  # --- Install Node ---
  case "${TARGETARCH}" in
    amd64) NODE_ARCH=x64 ;;
    arm64) NODE_ARCH=arm64 ;;
    *) echo "Unsupported target platform architecture: ${TARGETARCH}" >&2; exit 16 ;;
  esac;
  mkdir /opt/node
  curl -fsSLO --tlsv1.3 "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-\$NODE_ARCH.tar.xz"
  curl -fsSL --tlsv1.3 -o /tmp/nodejs-keyring.kbx https://github.com/nodejs/release-keys/raw/HEAD/gpg/pubring.kbx
  curl -fsSLO --tlsv1.3 "https://nodejs.org/dist/${NODE_VERSION}/SHASUMS256.txt.asc"
  gpgv --keyring=/tmp/nodejs-keyring.kbx --output SHASUMS256.txt < SHASUMS256.txt.asc
  sha256sum --check SHASUMS256.txt --ignore-missing
  tar -xJf "node-${NODE_VERSION}-linux-\$NODE_ARCH.tar.xz" -C /opt/node --strip-components=1
  rm /tmp/nodejs-keyring.kbx SHASUMS256.txt.asc SHASUMS256.txt "node-${NODE_VERSION}-linux-\$NODE_ARCH.tar.xz"
  PATH="\$PATH:/opt/node/bin"
  gosu vscode node --version
  gosu vscode npm --version
  gosu vscode env --chdir=/home/vscode zsh -c 'npm completion zsh > /home/vscode/.oh-my-zsh/completions/_npm'

  # --- Cleanup ---
  apt-get purge -y gosu
  apt-get autoremove -y
  apt-get clean
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
EOT

ENV LANG=en_US.utf8 LC_ALL=en_US.utf8 PATH="$PATH:/opt/node/bin:/opt/git/bin"

COPY --chown=vscode:vscode .zshrc /home/vscode/.zshrc
COPY --chown=root:root --from=git-build /opt/git /opt/git
RUN git --version

USER vscode
WORKDIR /workspaces/taiga-front-next
