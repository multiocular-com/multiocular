# Creates development machine inside docker
# so every developer will have the same environment

# registry.fedoraproject.org/fedora:42
FROM registry.fedoraproject.org/fedora@sha256:86117b6e2612d13a8b9ac75dd5956d88438fd704e3693466abf63c4ab821d87a

ARG TARGETARCH

ENV NODE_VERSION=24.8.0 \
  NODE_CHECKSUM_X64=2598641d188b41793930917f1a99a81c9615856b4205d408a44ab676c1acbb3d \
  NODE_CHECKSUM_ARM64=2598641d188b41793930917f1a99a81c9615856b4205d408a44ab676c1acbb3d

ENV PNPM_VERSION=10.15.1 \
  PNPM_CHECKSUM_X64=d4ac2a22e45b50da881855ea6a3734cf83f984eb5fba7163c3f07492fa43c2b0 \
  PNPM_CHECKSUM_ARM64=19bfe962692d285b0186a7305a0fc8b45dd7f1aeabfa61fc70f039ff8b74829a

RUN dnf install -yq zsh micro git tig psmisc procps-ng awk openssh-server \
  && dnf clean all \
  && rm -rf /var/cache/dnf \
  && mkdir -p /var/run/sshd \
  && ssh-keygen -A

RUN <<EOF
  if [ "$TARGETARCH" = "amd64" ]; then
    export NODE_CHECKSUM=$NODE_CHECKSUM_X64
    export PNPM_CHECKSUM=$PNPM_CHECKSUM_X64
    export PINACT_CHECKSUM=$PINACT_CHECKSUM_X64
    export ARCH="x64"
    export PINACT_ARCH="amd64"
  elif [ "$TARGETARCH" = "arm64" ]; then
    export NODE_CHECKSUM=$NODE_CHECKSUM_ARM64
    export PNPM_CHECKSUM=$PNPM_CHECKSUM_ARM64
    export PINACT_CHECKSUM=$PINACT_CHECKSUM_ARM64
    export ARCH="arm64"
    export PINACT_ARCH="arm64"
  else
    echo "Unsupported architecture: $TARGETARCH"
    exit 1
  fi

  curl "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${ARCH}.tar.xz" \
    --fail --show-error --location --silent --output /node.tar.xz
  echo "$NODE_CHECKSUM /node.tar.xz" | sha256sum -c
  tar -xf /node.tar.xz -C /usr/local --remove-files --strip-components=1 \
    --exclude='*.md' --exclude='LICENSE' \
    --exclude='share' --exclude='bin/corepack'
  rm /node.tar.xz

  curl "https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linux-${ARCH}" \
    --fail --show-error --location --silent --output /usr/local/bin/pnpm
  echo "$PNPM_CHECKSUM /usr/local/bin/pnpm" | sha256sum -c
  chmod a+rx /usr/local/bin/pnpm
EOF

RUN useradd -s /bin/zsh developer
USER developer

RUN pnpm config set store-dir /home/developer/.local/share/pnpm/store
RUN echo 'PS1="%d$ "' > ~/.zshrc
