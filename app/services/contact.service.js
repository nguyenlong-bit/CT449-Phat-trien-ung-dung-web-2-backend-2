const { ObjectId } = require('mongodb')

class ContactService {
    constructor(client) {
        this.Contact = client.db().collection("contacts")
    }

    extractConactData(payload) {
        const contact = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        }

        Object.keys(contact).forEach((key) => !contact[key] && delete contact[key])
        return contact
    }

    async create(payload) {
        const contact = this.extractConactData(payload)
        const res = await this.Contact.findOneAndUpdate(
            contact,
            { $set: { favorite: contact.favorite === true } },
            { returnDocument: "after", upsert: true }
        )
        return res
    }

    async find(filter) {
        const cursor = await this.Contact.find(filter)
        return await cursor.toArray()
    }

    async findByName(name) {
        const res = await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        })
        return res
    }

    async findById(id) {
        return await this,this.Contact.FindOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async update(id, payload) {
        const filter = {
           _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractConactData(payload)
        const result = await this.Contact.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value; //return result;
    }

    async delete(id) {
        const res = await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        })
        return res
    }

    async deleteAll() {
        const res = await this.Contact.deleteMany({})
        return res.deletedCount
    }

    async findFavorite() {
        const res = await this.find({ favorite: true })
        return res
    }
}

module.exports = ContactService