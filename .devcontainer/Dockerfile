# Creates development machine inside docker
# so every developer will have the same environment

# registry.fedoraproject.org/fedora:42
FROM registry.fedoraproject.org/fedora@sha256:86117b6e2612d13a8b9ac75dd5956d88438fd704e3693466abf63c4ab821d87a

ARG TARGETARCH

ENV NODE_VERSION=24.8.0 \
  NODE_CHECKSUM_X64=2598641d188b41793930917f1a99a81c9615856b4205d408a44ab676c1acbb3d \
  NODE_CHECKSUM_ARM64=2598641d188b41793930917f1a99a81c9615856b4205d408a44ab676c1acbb3d

ENV PNPM_VERSION=10.17.0 \
  PNPM_CHECKSUM_X64=e4a94da45ae61b3f4b808a7e17ca3628a7d6a381b9e20711140277080bade122 \
  PNPM_CHECKSUM_ARM64=68181bc09eed3eaf4ff661f449ef4ddf9ba253f54ebf7eca2bdc9bea358b2f42

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
