/* eslint-disable no-console */
const fs = require('fs')

class Report {
    constructor(contractName) {
        this.contractName = contractName
        this.report = {
            contract: {
                name: undefined,
                kind: undefined,
                documentation: undefined,
                variables: [],
                structs: [],
                enums: [],
                events: [],
                modifiers: [],
                functions: []
            }
        }
    }

    detectType(nodeTypeString) {
        let type = nodeTypeString

        switch (nodeTypeString) {
            case 'FunctionDefinition':
                type = 'Function'
                break
            case 'ContractDefinition':
                type = 'Contract'
                break
            case 'EventDefinition':
                type = 'Event'
                break
            case 'ModifierDefinition':
                type = 'Modifier'
                break
            case 'VariableDeclaration':
                type = 'Variable'
                break
            case 'StructDefinition':
                type = 'Struct'
                break
        }
        return type
    }

    deflateNodes(nodes) {
        nodes.forEach((node) => {
            if (node.name) {
                const item = {
                    name: node.name,
                    type: this.detectType(node.nodeType),
                    documentation: node.documentation ? node.documentation : undefined,
                    visibility: node.visibility ? node.visibility : undefined,
                    parameters: [],
                    members: []
                }

                switch (item.type) {
                    case 'Function':
                        this.report.contract.functions.push(item)
                        break
                    case 'Modifier':
                        this.report.contract.modifiers.push(item)
                        break
                    case 'Event':
                        this.report.contract.events.push(item)
                        break
                    case 'Contract':
                        this.report.contract.name = node.name
                        this.report.contract.kind = node.contractKind
                        this.report.contract.documentation = node.documentation
                        break
                    case 'Variable':
                        this.report.contract.variables.push(item)
                        break
                    case 'Struct':
                        this.report.contract.structs.push(item)
                        break
                    case 'EnumDefinition':
                        this.report.contract.enums.push(item)
                        break
                    default:
                        console.log('unhandled', item.type, node.name)
                        break
                }

                if (node.parameters) {
                    node.parameters.parameters.forEach((parameter) => {
                        const param = {
                            type: parameter.typeDescriptions.typeString,
                            name: parameter.name
                        }
                        item.parameters.push(param)
                    })
                }

                if (node.members) {
                    node.members.forEach((member) => {
                        const m = {
                            type: member.typeDescriptions ? member.typeDescriptions.typeString : '',
                            name: member.name
                        }
                        item.members.push(m)
                    })
                }
            }

            if (node.nodes) {
                this.deflateNodes(node.nodes)
            }
        })
    }

    generate() {
        let output = ''

        function logItem(item) {
            output += `\n### ${item.visibility ? item.visibility : ''} ${item.name}\n`

            if (item.documentation) {
                output +=
                    `\nDocumentation:\n
\`\`\`
${item.documentation}
\`\`\`
`
            }

            if (item.parameters.length > 0) {
                output += 'Parameters:\n'

                item.parameters.forEach((parameter) => {
                    output += `* ${parameter.type} ${parameter.name}\n`
                })
            }

            if (item.members.length > 0) {
                output += 'Members:\n'

                item.members.forEach((member) => {
                    output += `* ${member.type} ${member.name}\n`
                })
            }
        }

        console.log(`Generating doc for ${this.contractName}`)

        const contractString = fs.readFileSync(`./build/contracts/${this.contractName}.json`, 'utf-8')
        const contract = JSON.parse(contractString)

        this.deflateNodes(contract.ast.nodes)

        output += `\n# ${this.report.contract.kind}: ${this.report.contract.name}\n\n`

        if (this.report.contract.documentation) {
            output +=
                `Documentation:
\`\`\`
${this.report.contract.documentation}
\`\`\`
`
        }

        if (this.report.contract.structs.length > 0) {
            output += '\n## Structs\n'

            for (const struct of this.report.contract.structs) {
                logItem(struct)
            }
        }

        if (this.report.contract.enums.length > 0) {
            output += '\n## Enums\n'

            for (const enumEntry of this.report.contract.enums) {
                logItem(enumEntry)
            }
        }

        if (this.report.contract.variables.length > 0) {
            output += '\n## Variables\n'

            for (const variable of this.report.contract.variables) {
                logItem(variable)
            }
        }

        if (this.report.contract.events.length > 0) {
            output += '\n## Events\n'

            for (const event of this.report.contract.events) {
                logItem(event)
            }
        }

        if (this.report.contract.modifiers.length > 0) {
            output += '\n## Modifiers\n'

            for (const modifier of this.report.contract.modifiers) {
                logItem(modifier)
            }
        }

        if (this.report.contract.functions.length > 0) {
            output += '\n## Functions\n'

            for (const func of this.report.contract.functions) {
                logItem(func)
            }
        }
        return output.toString()
    }
}

module.exports = {
    Report
}
