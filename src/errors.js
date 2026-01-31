export class UserCancellationError extends Error {
    constructor(message = "Operation cancelled by user") {
        super(message)
        this.name = "UserCancellationError"
    }
}

export class ValidationError extends Error {
    constructor(message) {
        super(message)
        this.name = "ValidationError"
    }
}

export class ConfigError extends Error {
    constructor(message) {
        super(message)
        this.name = "ConfigError"
    }
}
