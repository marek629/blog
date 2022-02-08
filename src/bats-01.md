![](img/header-bats-module.png)

*Written on 2022-02-08 by Marek Jędryka*

# Bats Introduction for JavaScript Developers

Bats (Bash Automated Test System) is a tool for testing CLI (Command Line Interface) applications built on the top of the Bash shell.
It's a great option for black-box testing.

## Why do I need it?

You can need Bats if you develop CLI application, for example using node.js technology stack.

During software development that offers a text-mode interface, probably you would need to check your CLI works properly with many different options, arguments, or switches.
Of course, you can check your application manually when your CLI is small, but the CLI would grow over time.
As the number of text-mode options increases, the number of test cases increases to a value that is difficult to control manually.
Plus there is the problem of runtime context, i.e. current working directory, environment variables, etc.

Therefore you will want to automate your manual CLI tests and incorporate to system tests set.
It will probably be done faster than you expect.

## Basic Concepts

Bats is a testing framework for Bash that uses its own file extension `.bats`.
It provides a convenient way to create, name and execute test cases by running shell commands.
It's possible thanks to special `@test` annotation, so you can figure out an analogy of test runners known from the JS ecosystem.
And finally, it offers a few report formatters, including TAP output.

Inside the test case code block you're able to execute any bash command, especially two things: your application and `test` command short syntax for output validation and exit status code of the finished process.
Bats brings you in a `run` helper command to store the exit status and the output to special global variables: `$status` and `$output`.
Simple example of Bats test case is placed below.

```bats
@test "execute from root project directory" {
  run src/cli.js -p 'yarn ava test/skipping.test.js --tap' -t
  result="$(echo $output | grep ERR_MODULE_NOT_FOUND | wc -l)"
  [ "$result" -eq 0 ]
}
```

Report of this test case in default format looks following:

- on success (font is green in my terminal)
	```
	 ✓ execute from root project directory
	```
- and on failure (font is red in my terminal)
	```
	 ✗ execute from root project directory
	   (in test file test/test.bats, line 12)
	     `[ "$result" -eq 0 ]' failed
	```

Sadly, I can't see what is the problem in the output of failed test case.
I must rerun the tested command by myself for now.
I will show you a better way in the next section.

Bats offers a few tools accordant with DRY (Don't Repeat Yourself) philosophy:

- `setup_file` funtion that is `before` hook
- `setup` funtion that is `beforeEach` hook
- `teardown` funtion that is `afterEach` hook
- `teardown_file` funtion that is `after` hook
- `load` function loads given Bats library or any `*.bash` file, similar as bash's command `source` loads any `*.sh` file

```bats
setup() {
  load '../node_modules/bats-support/load'
  load '../node_modules/bats-assert/load'
}
```

And last but not least, Bats allows skipping selected test case by `skip` function.

### Bats Assertion Library

As I signaled in the previous section, you can load a Bats library in your `.bats` file.
I suppose that the most frequently used library is `bats-assert`.
It includes many convenient assertion functions that you can use instead of bash's `test` commands, which is often not so clear at all.

The `bats-assert` package offers two types of assertions.
The first one is a positive assertion, i.e. true is expected as parameter or result of assertion.
All such assertion functions start their name with `assert`.
They are `assert`, `assert_equal`, `assert_not_equal`, `assert_success`, `assert_failure`, `assert_output` and `assert_line`.
The second kind of assertions is the negative ones.
Their names start with `refute` and they are as follows: `refute`, `refute_output` and `refute_line`.

In my opinion, the most useful functions are focused on the output and exit code of the process under test.
I believe so because these two things are the main care when I test my applications as black-box.
I check if the process is finished with `0` status code (`assert_success`) or any other (`assert_failure`).
Next, I verify if output of my process looks good as entity (`assert_output`) and it doesn't contain undesired lines (`refute_line`) about warnings, errors and so on.
If I don't know full expected output or line, or it doesn't matter in current test case, I can use `-p` (alias of `--partial`) switch.
If I need to, I can also use a regular expression (`-e` or `--regexp` switch) in this case.

In the face of this, the previous test case can be rewritten to:

```bats
@test "execute from root project directory" {
  run src/cli.js -p 'yarn ava test/skipping.test.js --tap' -t
  refute_line -p ERR_MODULE_NOT_FOUND
}
```

This is much easier to read, isn't it?
And it has an additional asset: brilliant, human-readable assertion failure error.
Let's say that I did a mistake in the imported module name in my `src/cli.js` file.
After the last change, Bats prints a nice test case failure message:

```
 ✗ execute from root project directory
   (from function `refute_line' in file test/../node_modules/bats-assert/src/assert.bash, line 722,
    in test file test/test.bats, line 11)
     `refute_line -p ERR_MODULE_NOT_FOUND' failed
   
   -- no line should contain substring --
   substring : ERR_MODULE_NOT_FOUND
   index     : 3
   output (17 lines):
     node:internal/errors:464
         ErrorCaptureStackTrace(err);
         ^
   > 
     Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tap-nya' imported from /home/marek/projects/tap-nyan-ogg-master/src/cli.js
         at new NodeError (node:internal/errors:371:5)
         at packageResolve (node:internal/modules/esm/resolve:864:9)
         at moduleResolve (node:internal/modules/esm/resolve:910:18)
         at defaultResolve (node:internal/modules/esm/resolve:1005:11)
         at ESMLoader.resolve (node:internal/modules/esm/loader:530:30)
         at ESMLoader.getModuleJob (node:internal/modules/esm/loader:251:18)
         at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:79:40)
         at link (node:internal/modules/esm/module_job:78:36) {
       code: 'ERR_MODULE_NOT_FOUND'
     }
     
     Node.js v17.3.0
   --
```

I got the whole output of failed test case.
It's a great power of `bats-assert`.
I love it!

### References

- https://bats-core.readthedocs.io/en/stable/tutorial.html
- https://bats-core.readthedocs.io/en/stable/installation.html
- https://bats-core.readthedocs.io/en/stable/writing-tests.html
- https://github.com/bats-core/bats-assert#readme

## Installation

Bats ships plenty of options for its installation.
It could be installed as `npm` package, cloned by `git` and then installed from source, or built on the top of prepared image and run as Docker container.
Moreover, you can install globally using your operating system tools.
For Linux-based machines, it could be a distro-specific package manager, for example, `pacman` or `apt-get` CLI commands.

In my development environment, I prefer to have `bats` installed globally by `pacman` (the package manager at my Linux distribution).
At the same time, I install Bats libraries locally (by project) using NPM repository.
It's caused by loading Bats libraries using relative paths, from `node_modules` in this case, which is more elastic for use in many different environments.
No configuration and no environment variables are needed.
So my Bats setup workflow on fresh system is looking as follows:

```bash
pacman -S bats
yarn add -D bats bats-{assert,support}
```

As you could notice, I installed `bats` twice - by `pacman` and `yarn`.
I did it because I want to be able to run `bats` by `yarn` on another machine event without `bats` installed globally.
So it's redundant but deliberated.
I can use alternative one of both ways of running `bats` - just `bats` or `yarn bats`.
However, the first one could be run on machines with installed Bats globally only.

### References

- https://bats-core.readthedocs.io/en/stable/installation.html
- https://www.npmjs.com/package/bats
- https://www.npmjs.com/package/bats-assert
- https://www.npmjs.com/package/bats-support

## Assertions Tips

Let me introduce a tiny Rosetta of basic operations on the output string.
I will show JS pseudo-code first, and then its equivalent in `bats-core` and `bats-assert` flavoured syntax test cases.

### Output string includes

```JS
const output = 'contra vim mortis non est medicamen in hortis'
output.includes('mortis')
```

```bats
@test "output includes 'mortis' using bats-core only" {
  run echo "contra vim mortis non est medicamen in hortis"
  result="$(echo $output | grep mortis | wc -l)"
  [ "$result" -ge 0 ]
}

@test "output includes 'mortis' using bats-assert" {
  run echo "contra vim mortis non est medicamen in hortis"
  assert_output -p mortis
}
```

### Output string ends with

```JS
const output = 'contra vim mortis non est medicamen in hortis'
output.endsWith('hortis')
```

```bats
@test "output ends with 'hortis' using bats-core only" {
  run echo "contra vim mortis non est medicamen in hortis"
  result="$(echo $output | rev | cut -d ' ' -f 1 | rev )"
  [ "$result" == "hortis" ]
}

@test "output ends with 'hortis' using bats-assert" {
  run echo "contra vim mortis non est medicamen in hortis"
  assert_output -e 'hortis$'
}
```

### Output string starts with

```JS
const output = 'contra vim mortis non est medicamen in hortis'
output.startsWith('contra')
```

```bats
@test "output starts with 'contra' using bats-core only" {
  run echo "contra vim mortis non est medicamen in hortis"
  result="$(echo $output | cut -d ' ' -f 1 )"
  [ "$result" == "contra" ]
}

@test "output starts with 'contra' using bats-assert" {
  run echo "contra vim mortis non est medicamen in hortis"
  assert_output -e '^contra'
}
```

