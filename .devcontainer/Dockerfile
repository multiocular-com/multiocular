# Creates development machine inside docker
# so every developer will have the same environment

# registry.fedoraproject.org/fedora:42
FROM registry.fedoraproject.org/fedora@sha256:b41d3556510008c09b2fac91ecfb99cbbb6fadc9549ec4deac2af2d8dfc50e90

ARG TARGETARCH

ENV NODE_VERSION=24.9.0 \
  NODE_CHECKSUM_X64=f52ec50e959d72d5c680d9731420b2661cd2a8070e94c7369b6ddfcd8b7278be \
  NODE_CHECKSUM_ARM64=5a5b1dc4906e891a655d2f0689db664879724f2d9e63309486fd588172a052bc

ENV PNPM_VERSION=10.18.1 \
  PNPM_CHECKSUM_X64=6f8ae185edfb0ef1ed4fd94f399b9b8a990eab5636aaeac9b0d3556ce0143e27 \
  PNPM_CHECKSUM_ARM64=a4e24d3b1171dce6a7c35f7fc75e6ce20f4d9932318ac892d7508b19af298d89

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

RUN mkdir -p /home/developer/.local/share/pnpm \
  && pnpm config set store-dir /home/developer/.local/share/pnpm/store
RUN echo 'PS1="%d$ "' > ~/.zshrc
