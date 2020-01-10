<center><pre style="font-size: 15pt; font-family: 'Courier New', Monospace; line-height: .5; white-space: pre;">
▄▀▀▀█ █▀▀▀▄<br/>
█   █ █   █<br/>
▀▀ █ ▒ ▀▀<br/>
· - █▄▄ ▪ ·<br/>
▀
</pre></center>

    ▄▀▀▀█ █▀▀▀▄
    █   █ █   █   qp - 0.0.1
     ▀▀ █ ▒ ▀▀    query-pipe: command-line (ND)JSON querying 
    · - █▄▄ ▪ ·  ·------------------------------------------·
        ▀

A tool for processing and filtering JSON from the command-line.
Automatically interprets Newline Delimited JSON (NDJSON) from `stdin`,
including pretty-printed NDJSON, and can optionally query top-level array input.

Without any arguments qp is a straight stdin to stdout pipe for valid JSON.

# Install

# Usage

# Syntax

# Building

qp is built with [QuickJS](https://bellard.org/quickjs/).

To install QuickJS and the @paybase/csp dependency, run:

    $ sh install.sh

You can provide `QJS_VERSION` and `CSP_VERSION` environment variables to the command above.
By default the script will install QuickJS@2019-12-21 and @paybase/csp@1.0.8.

It will take a while to compile QuickJS, however when that process is complete, you can
build qp by running:

    $ sh build.sh
